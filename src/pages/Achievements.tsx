import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStreak } from '@/hooks/useStreak';
import { BadgeGallery } from '@/components/gamification/BadgeGallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Flame, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Achievements = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { streak } = useStreak(user?.id ?? null, true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) return null;

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const totalDays = streak?.total_active_days ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back link */}
        <Link
          to="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </Link>

        {/* Hero Streak Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Flame className={`w-12 h-12 ${currentStreak > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-2">
            {currentStreak}
          </h1>
          <p className="text-xl text-muted-foreground">
            {currentStreak === 1 ? 'Day Streak' : 'Day Streak'}
          </p>
          {currentStreak === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Start your streak by running an analysis!
            </p>
          )}
          {streak && currentStreak === longestStreak && currentStreak > 1 && (
            <span className="inline-block mt-3 px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
              🎉 New personal record!
            </span>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">Record Streak</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalDays}</p>
            <p className="text-sm text-muted-foreground">Total Active Days</p>
          </div>
        </div>

        {/* Badges Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Badges</h2>
          <BadgeGallery userId={user.id} size="lg" />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Achievements;
