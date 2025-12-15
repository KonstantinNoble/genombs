import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrategyPhase {
  title: string;
  objective: string;
  timeframe: string;
  actions: Array<{ text: string; completed?: boolean }>;
  milestones?: string[];
}

interface FocusTask {
  task_title: string;
  task_description: string;
  task_type: string;
  priority: number;
  estimated_duration: string;
  phase_index: number;
  action_index: number | null;
  ai_reasoning: string;
}

const MAX_DAILY_GENERATIONS = 3;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get today's date in UTC
    const today = new Date().toISOString().split('T')[0];

    // Check premium status and daily generation limit
    const { data: credits, error: creditsError } = await supabaseClient
      .from('user_credits')
      .select('is_premium, daily_autopilot_generations, autopilot_generation_reset_date')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('Error fetching credits:', creditsError);
    }

    if (!credits?.is_premium) {
      return new Response(JSON.stringify({ error: 'Premium required for Autopilot feature' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { strategy_id, force_regenerate = false } = await req.json();

    if (!strategy_id) {
      return new Response(JSON.stringify({ error: 'strategy_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get strategy with progress
    const { data: strategy, error: strategyError } = await supabaseClient
      .from('active_strategies')
      .select('*')
      .eq('id', strategy_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (strategyError || !strategy) {
      return new Response(JSON.stringify({ error: 'Strategy not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if tasks already exist for today for THIS strategy
    const { data: existingTasks } = await supabaseClient
      .from('autopilot_focus_tasks')
      .select('*')
      .eq('strategy_id', strategy_id)
      .eq('generated_for_date', today);

    // Get current generation count for returning remaining
    const resetDate = credits?.autopilot_generation_reset_date;
    const currentGenCount = resetDate === today ? (credits?.daily_autopilot_generations || 0) : 0;
    const remainingForCached = Math.max(0, MAX_DAILY_GENERATIONS - currentGenCount);

    // If tasks exist and not forcing regeneration, return them
    if (!force_regenerate && existingTasks && existingTasks.length > 0) {
      console.log('Tasks already exist for today, returning existing');
      return new Response(JSON.stringify({ 
        tasks: existingTasks, 
        cached: true,
        streak: strategy.current_streak || 0,
        longestStreak: strategy.longest_streak || 0,
        remaining_generations: remainingForCached,
        max_generations: MAX_DAILY_GENERATIONS
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate reset time (next UTC midnight)
    const getResetTime = () => {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      return tomorrow.toISOString();
    };

    // Check global daily generation limit (only when generating NEW tasks)
    const needsNewGeneration = force_regenerate || !existingTasks || existingTasks.length === 0;
    
    // Reset counter if it's a new day (use resetDate from above)
    let currentGenerations = credits?.daily_autopilot_generations || 0;
    
    if (resetDate !== today) {
      // New day, reset counter
      currentGenerations = 0;
      await supabaseClient
        .from('user_credits')
        .update({ 
          daily_autopilot_generations: 0,
          autopilot_generation_reset_date: today
        })
        .eq('user_id', user.id);
    }

    // Calculate remaining generations
    const remainingGenerations = Math.max(0, MAX_DAILY_GENERATIONS - currentGenerations);
    
    if (needsNewGeneration) {
      // Check if limit reached
      if (currentGenerations >= MAX_DAILY_GENERATIONS) {
        console.log(`Daily generation limit reached for user ${user.id}: ${currentGenerations}/${MAX_DAILY_GENERATIONS}`);
        return new Response(JSON.stringify({ 
          error: 'Daily AI generation limit reached',
          limit_reached: true,
          reset_time: getResetTime(),
          remaining_generations: 0,
          max_generations: MAX_DAILY_GENERATIONS
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Delete existing tasks for regeneration if forcing
    if (force_regenerate && existingTasks && existingTasks.length > 0) {
      await supabaseClient
        .from('autopilot_focus_tasks')
        .delete()
        .eq('strategy_id', strategy_id)
        .eq('generated_for_date', today);
    }

    // Get phase progress
    const { data: phaseProgress } = await supabaseClient
      .from('strategy_phase_progress')
      .select('*')
      .eq('strategy_id', strategy_id)
      .order('phase_index', { ascending: true });

    // Parse strategy data
    const originalResult = strategy.original_result as any;
    const phases: StrategyPhase[] = originalResult?.strategies || [];

    // Build context for AI
    let progressContext = '';
    phases.forEach((phase, index) => {
      const progress = phaseProgress?.find(p => p.phase_index === index);
      const completedActions = progress?.actions_completed || [];
      const totalActions = phase.actions?.length || 0;
      const status = progress?.status || 'not_started';
      
      progressContext += `\nPhase ${index + 1}: "${phase.title}"
- Status: ${status}
- Timeframe: ${phase.timeframe}
- Progress: ${completedActions.length}/${totalActions} actions completed
- Objective: ${phase.objective}
- Remaining actions:\n`;
      
      phase.actions?.forEach((action, actionIndex) => {
        const isCompleted = completedActions.includes(actionIndex);
        if (!isCompleted) {
          progressContext += `  - [${actionIndex}] ${typeof action === 'string' ? action : action.text}\n`;
        }
      });
    });

    const systemPrompt = `You are a productivity coach for business strategies. Your task is to generate 1-3 focused daily tasks that help the user implement their strategy.

CRITICAL: ALL output MUST be in English, regardless of the input language.

IMPORTANT: Respond ONLY with a JSON array. No explanations, no markdown, just the JSON.

Prioritize tasks by:
1. Blocking tasks (what needs to be done first?)
2. Quick wins (what can be completed quickly?)
3. Momentum builders (what creates visible progress?)

Each task must have these fields (ALL IN ENGLISH):
- task_title: Short and actionable (max 60 characters, English only)
- task_description: 1-2 concrete sentences (English only)
- task_type: "action" | "preparation" | "review"
- priority: 1 (highest) to 3
- estimated_duration: e.g. "30 min", "1-2 hours"
- phase_index: Index of the phase (0-based)
- action_index: Index of the action in the phase (0-based) or null if generic task
- ai_reasoning: Why this task is important today (1 sentence, English only)`;

    const userPrompt = `Analyze this business strategy and generate 1-3 focused tasks for TODAY:

Strategy: "${strategy.name}"
Overall progress: ${strategy.completed_actions}/${strategy.total_actions} actions, ${strategy.completed_phases}/${strategy.total_phases} phases

${progressContext}

Generate 1-3 prioritized tasks as JSON array now:`;

    console.log('Calling Lovable AI for task generation...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', content);

    // Parse JSON from response
    let tasks: FocusTask[] = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      tasks = [{
        task_title: 'Review your strategy progress',
        task_description: 'Check your current progress and plan the next steps.',
        task_type: 'review',
        priority: 1,
        estimated_duration: '15 min',
        phase_index: 0,
        action_index: null,
        ai_reasoning: 'A regular review helps maintain focus and momentum.'
      }];
    }

    // Insert tasks into database
    const tasksToInsert = tasks.map((task, index) => ({
      strategy_id,
      user_id: user.id,
      task_title: task.task_title,
      task_description: task.task_description,
      task_type: task.task_type || 'action',
      priority: task.priority || index + 1,
      estimated_duration: task.estimated_duration,
      phase_index: task.phase_index,
      action_index: task.action_index,
      ai_reasoning: task.ai_reasoning,
      generated_for_date: today,
      is_completed: false,
    }));

    const { data: insertedTasks, error: insertError } = await supabaseClient
      .from('autopilot_focus_tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('Failed to insert tasks:', insertError);
      throw insertError;
    }

    // Increment the global daily generation counter (use currentGenerations which may have been reset)
    await supabaseClient
      .from('user_credits')
      .update({ 
        daily_autopilot_generations: currentGenerations + 1,
        autopilot_generation_reset_date: today
      })
      .eq('user_id', user.id);

    console.log(`Incremented daily generation count for user ${user.id}: ${currentGenerations + 1}/${MAX_DAILY_GENERATIONS}`);

    // Update strategy last generated timestamp
    await supabaseClient
      .from('active_strategies')
      .update({ 
        autopilot_last_generated: new Date().toISOString(),
        autopilot_enabled: true 
      })
      .eq('id', strategy_id);

    // Calculate streak - only based on yesterday's completed tasks
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: yesterdayTasks } = await supabaseClient
      .from('autopilot_focus_tasks')
      .select('is_completed')
      .eq('strategy_id', strategy_id)
      .eq('generated_for_date', yesterdayStr);

    let newStreak = strategy.current_streak || 0;
    
    // Streak logic: if yesterday had tasks and ALL were completed, increment
    // If yesterday had tasks but not all completed, reset to 0
    // If yesterday had no tasks, keep current streak (user might have started fresh)
    if (yesterdayTasks && yesterdayTasks.length > 0) {
      const allCompleted = yesterdayTasks.every(t => t.is_completed);
      if (allCompleted) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }
    }
    // If no tasks yesterday, keep streak as is (don't break streak for first day)

    const longestStreak = Math.max(newStreak, strategy.longest_streak || 0);

    await supabaseClient
      .from('active_strategies')
      .update({ 
        current_streak: newStreak,
        longest_streak: longestStreak
      })
      .eq('id', strategy_id);

    // Calculate new remaining after this generation
    const newRemainingGenerations = Math.max(0, remainingGenerations - 1);
    
    console.log('Successfully generated focus tasks:', insertedTasks?.length);

    return new Response(JSON.stringify({ 
      tasks: insertedTasks, 
      cached: false,
      streak: newStreak,
      longestStreak,
      remaining_generations: newRemainingGenerations,
      max_generations: MAX_DAILY_GENERATIONS
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in generate-focus-tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
