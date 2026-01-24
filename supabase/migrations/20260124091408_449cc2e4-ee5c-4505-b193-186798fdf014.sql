CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSON;
  v_validation_stats JSON;
  v_decision_stats JSON;
  v_model_usage JSON;
  v_confidence_trend JSON;
BEGIN
  -- Validation statistics (with corrected consensus_rate including majority_points)
  SELECT json_build_object(
    'total_validations', COUNT(*),
    'avg_confidence', COALESCE(ROUND(AVG(overall_confidence)::numeric, 1), 0),
    'high_confidence_count', COUNT(*) FILTER (WHERE overall_confidence >= 75),
    'medium_confidence_count', COUNT(*) FILTER (WHERE overall_confidence BETWEEN 50 AND 74),
    'low_confidence_count', COUNT(*) FILTER (WHERE overall_confidence < 50),
    'first_validation', MIN(created_at),
    'last_validation', MAX(created_at),
    'active_days', COUNT(DISTINCT DATE(created_at)),
    'consensus_rate', COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE 
          (consensus_points IS NOT NULL AND jsonb_array_length(consensus_points) > 0)
          OR 
          (majority_points IS NOT NULL AND jsonb_array_length(majority_points) > 0)
        )::numeric 
         / NULLIF(COUNT(*), 0) * 100), 0
      ), 0
    )
  )
  INTO v_validation_stats
  FROM validation_analyses
  WHERE user_id = p_user_id;

  -- Decision record statistics
  SELECT json_build_object(
    'total_decisions', COUNT(*),
    'confirmed_decisions', COUNT(*) FILTER (WHERE user_confirmed_ownership = true),
    'draft_count', COUNT(*) FILTER (WHERE status = 'draft'),
    'confirmed_count', COUNT(*) FILTER (WHERE status = 'confirmed'),
    'total_exports', COALESCE(SUM(export_count), 0)
  )
  INTO v_decision_stats
  FROM decision_records
  WHERE user_id = p_user_id;

  -- Model usage statistics
  SELECT json_build_object(
    'gpt5', COUNT(*) FILTER (WHERE 'gpt5' = ANY(selected_models)),
    'geminiPro', COUNT(*) FILTER (WHERE 'geminiPro' = ANY(selected_models)),
    'geminiFlash', COUNT(*) FILTER (WHERE 'geminiFlash' = ANY(selected_models)),
    'perplexity', COUNT(*) FILTER (WHERE 'perplexity' = ANY(selected_models)),
    'claude', COUNT(*) FILTER (WHERE 'claude' = ANY(selected_models))
  )
  INTO v_model_usage
  FROM validation_analyses
  WHERE user_id = p_user_id;

  -- Confidence trend (last 30 validations with date and confidence)
  SELECT COALESCE(json_agg(trend ORDER BY trend.created_at ASC), '[]'::json)
  INTO v_confidence_trend
  FROM (
    SELECT 
      created_at,
      overall_confidence as confidence,
      DATE(created_at) as date
    FROM validation_analyses
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 30
  ) trend;

  -- Combine all stats
  result := json_build_object(
    'validation_stats', v_validation_stats,
    'decision_stats', v_decision_stats,
    'model_usage', v_model_usage,
    'confidence_trend', v_confidence_trend
  );

  RETURN result;
END;
$function$;