import { Table } from '@/components/Table';
import { 
  getOverallLoopLeaderboard, 
  getClimberScoreLeaderboard, 
  getDownhillScoreLeaderboard 
} from '@/lib/leaderboards';

export default async function LeaderboardPage() {
  // Fetch data using Prisma-style queries
  const overallData = await getOverallLoopLeaderboard();
  const climberData = await getClimberScoreLeaderboard();
  const downhillData = await getDownhillScoreLeaderboard();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            4SOH Race Leaderboards
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Track your performance across the Overall Loop, Climbing, and Downhill segments. 
            Complete the loop to qualify for climbing and downhill leaderboards.
          </p>
        </header>

        {/* Mobile Layout - Stacked Tables */}
        <div className="block lg:hidden space-y-8">
          <Table {...overallData} />
          <Table {...climberData} />
          <Table {...downhillData} />
        </div>

        {/* Desktop Layout - Side by Side Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          <Table {...overallData} />
          <Table {...climberData} />
          <Table {...downhillData} />
        </div>

        {/* Rules Section */}
        <section className="mt-16 p-6 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">📋 Rules & Scoring</h2>
          <div className="grid md:grid-cols-3 gap-6 text-white/80">
            <div>
              <h3 className="font-semibold text-white mb-2">🏆 Overall Loop</h3>
              <p className="text-sm">
                Best time on segment 7977451 per season. This is the qualifying requirement 
                for climbing and downhill leaderboards.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🏔️ Best Climber</h3>
              <p className="text-sm">
                Sum of best times on segments 9589287 + 18229887. Only shown for seasons 
                where you completed the Overall Loop.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🏂 Fastest Downhill</h3>
              <p className="text-sm">
                Sum of best times on segments 2105607 + 1359027. Only shown for seasons 
                where you completed the Overall Loop.
              </p>
            </div>
          </div>
        </section>

        {/* Connect Strava CTA */}
        <section className="mt-12 text-center">
          <div className="p-8 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">🚀 Connect Your Strava</h2>
            <p className="text-white/70 mb-6">
              Connect your Strava account to automatically sync your segment times and appear on the leaderboards.
            </p>
            <a
              href="/race-tracker"
              className="inline-block px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors"
            >
              Connect Strava & Get My Times
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

