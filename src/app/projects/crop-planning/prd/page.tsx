import SiteHeader from "@/components/layout/SiteHeader";
import Link from "next/link";
import PillArrow from "@/components/ui/PillArrow";

export const metadata = { title: "PRD: Crop Planning App — Switchback Labs" };

export default function CropPlanningPRD() {
  return (
    <>
      <SiteHeader />

      <section className="relative">
        <div className="section">
          <p className="text-[11px] tracking-widest uppercase text-muted mb-6">
            Product Requirements Document
          </p>
          <h1 className="h2">CROP PLANNING & BUDGETING APP</h1>
          <p className="lead mt-6 max-w-[62ch]">
            Complete product specification for MVP: user personas, feature requirements,
            technical architecture, and success metrics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects/crop-planning" className="btn btn-pill">
              Back to overview <PillArrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-paper">
        <div className="container-std">
          <div className="max-w-3xl prose prose-sm">
            <h2>1. Product Overview</h2>

            <div className="not-prose bg-gray-100 p-6 rounded-lg mb-8">
              <h3 className="font-semibold mb-2">Vision</h3>
              <p className="text-muted">
                Empower small to medium-sized farms to plan crop budgets, track expenses,
                and make informed planting decisions through simple, accessible crop planning tools.
              </p>
            </div>

            <p><strong>Target Release:</strong> MVP - Q2 2026</p>

            <p><strong>Success Metrics:</strong></p>
            <ul>
              <li>50+ farms actively using the platform within 3 months of launch</li>
              <li>80% of users create at least one complete crop budget</li>
              <li>Users track actuals for at least 60% of their budgeted line items</li>
            </ul>

            <h2>2. Target Users</h2>

            <div className="not-prose border border-line p-6 rounded-lg mb-8">
              <h3 className="font-semibold mb-3">Primary Persona: Farm Owner/Operator</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Manages 50-500 acres</li>
                <li>• Grows 2-5 different crop types annually</li>
                <li>• Currently uses spreadsheets or paper for planning</li>
                <li>• Needs to understand profitability per field and per crop</li>
                <li>• Makes fertilizer and chemical purchasing decisions</li>
                <li>• Basic tech literacy, uses smartphone and computer daily</li>
              </ul>
              <p className="mt-4 text-sm"><strong>MVP Scope:</strong> Single-user accounts (no team collaboration in MVP)</p>
            </div>

            <h2>3. Core Problems We&apos;re Solving</h2>
            <ol>
              <li><strong>Budget Uncertainty:</strong> Farmers struggle to predict costs before planting season</li>
              <li><strong>Expense Tracking:</strong> Hard to know if they&apos;re staying on budget without real-time tracking</li>
              <li><strong>Profitability Blindness:</strong> Unclear which fields/crops are actually profitable</li>
              <li><strong>Planning Complexity:</strong> Managing multiple crops across multiple fields is mentally taxing</li>
            </ol>

            <h2>4. MVP Feature Specifications</h2>

            <h3>4.1 User Authentication & Account</h3>
            <ul>
              <li>Email/password sign-up and login</li>
              <li>Password reset functionality</li>
              <li>Basic profile (farm name, location, total acreage)</li>
            </ul>
            <div className="not-prose bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm"><strong>Technical Note:</strong> Use industry-standard authentication library
              (like Auth0, Firebase Auth, or similar) rather than building from scratch. This handles security
              best practices like password hashing, session management, and token refresh.</p>
            </div>

            <h3>4.2 Farm Setup - Fields Management</h3>
            <ul>
              <li>Create/edit/delete fields</li>
              <li>Field attributes:
                <ul>
                  <li>Field name (e.g., &quot;North 40&quot;, &quot;River Bottom&quot;)</li>
                  <li>Acreage (decimal support for partial acres)</li>
                  <li>Notes (optional text field)</li>
                </ul>
              </li>
            </ul>
            <p><strong>Data Model:</strong> Each field is a distinct entity that can have multiple crop plantings associated with it.</p>

            <h3>4.3 Crop Planning</h3>
            <p><strong>Create Crop Planting</strong></p>
            <ul>
              <li>Associate with a specific field</li>
              <li>Crop details:
                <ul>
                  <li>Crop type (dropdown: Corn, Soybeans, Wheat, Cotton, Vegetables, Other)</li>
                  <li>Variety/Hybrid name (text field)</li>
                  <li>Planted acres (can be less than field size)</li>
                  <li>Planting date</li>
                  <li>Expected harvest date</li>
                  <li>Expected yield (bushels/acre or tons/acre depending on crop)</li>
                  <li>Expected price per unit</li>
                </ul>
              </li>
            </ul>
            <div className="not-prose bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
              <p className="text-sm"><strong>Technical Note:</strong> This design allows multiple crops per field.
              Each &quot;crop planting&quot; is a separate record linked to a field. For example, Field A could have
              &quot;Spring Wheat (100 acres, March-July)&quot; and &quot;Fall Soybeans (100 acres, August-November)&quot;.</p>
            </div>

            <h3>4.4 Budget Planning</h3>
            <p><strong>Budget Categories (per crop planting):</strong></p>
            <ul>
              <li>Seed</li>
              <li>Fertilizer</li>
              <li>Chemical</li>
              <li>Irrigation</li>
              <li>Equipment</li>
              <li>Precision Ag Services</li>
              <li>Other</li>
            </ul>

            <p><strong>Budget Line Items:</strong></p>
            <ul>
              <li>Category (from list above)</li>
              <li>Description (e.g., &quot;Starter Fertilizer 10-34-0&quot;)</li>
              <li>Planned cost per acre</li>
              <li>Total planned cost (calculated: cost/acre × planted acres)</li>
              <li>Application timing/notes (optional text)</li>
            </ul>

            <p><strong>Budget Summary View:</strong></p>
            <ul>
              <li>Total budgeted cost per crop planting</li>
              <li>Cost per acre</li>
              <li>Projected revenue (expected yield × expected price)</li>
              <li>Projected profit margin</li>
            </ul>

            <h3>4.5 Actual Expense Tracking</h3>
            <p><strong>Record Actual Expenses:</strong></p>
            <ul>
              <li>Link to specific crop planting</li>
              <li>Category (same as budget categories)</li>
              <li>Description</li>
              <li>Actual cost</li>
              <li>Date incurred</li>
              <li>Receipt/notes (optional)</li>
            </ul>

            <p><strong>Actuals View:</strong></p>
            <ul>
              <li>Shows budget vs actual by category</li>
              <li>Visual indicator when over/under budget</li>
              <li>Running total of actual costs</li>
              <li>Variance calculations (actual - budget)</li>
            </ul>

            <h3>4.6 Reporting & Analysis</h3>
            <p><strong>Budget vs Actual Report</strong> (per crop planting):</p>
            <ul>
              <li>Side-by-side comparison table</li>
              <li>Category-level breakdown</li>
              <li>Total variance</li>
              <li>Profit/loss projection updated with actuals</li>
            </ul>

            <p><strong>Farm Summary Dashboard:</strong></p>
            <ul>
              <li>Total budgeted costs across all crops</li>
              <li>Total actual costs to date</li>
              <li>Overall budget variance</li>
              <li>List of all active crop plantings with quick stats</li>
            </ul>

            <h2>5. User Flows</h2>

            <h3>Flow 1: New User Setup</h3>
            <ol>
              <li>Sign up with email/password</li>
              <li>Enter farm name and total acreage</li>
              <li>Add first field (name + acreage)</li>
              <li>Create first crop planting</li>
              <li>Add budget line items</li>
              <li>View budget summary</li>
            </ol>

            <h3>Flow 2: Track Expense</h3>
            <ol>
              <li>From dashboard, select crop planting</li>
              <li>Click &quot;Add Actual Expense&quot;</li>
              <li>Select category, enter details and cost</li>
              <li>Save</li>
              <li>View updated budget vs actual</li>
            </ol>

            <h2>6. Technical Architecture</h2>

            <h3>Frontend</h3>
            <ul>
              <li><strong>Framework:</strong> React (recommended for ecosystem and hiring)</li>
              <li><strong>Responsive Design:</strong> Tailwind CSS for mobile-friendly components</li>
              <li><strong>State Management:</strong> React Context API for MVP</li>
            </ul>

            <h3>Backend</h3>
            <ul>
              <li><strong>Framework:</strong> Node.js with Express</li>
              <li><strong>Database:</strong> PostgreSQL (relational data)</li>
            </ul>

            <h3>Database Schema (simplified)</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto"><code>{`Users
- id, email, password_hash, farm_name, farm_acreage

Fields
- id, user_id, name, acreage, notes

CropPlantings
- id, field_id, crop_type, variety, planted_acres, 
  planting_date, harvest_date, expected_yield, expected_price

BudgetItems
- id, crop_planting_id, category, description, 
  cost_per_acre, total_cost, notes

ActualExpenses
- id, crop_planting_id, category, description, 
  actual_cost, date_incurred, notes`}</code></pre>

            <h3>Hosting</h3>
            <ul>
              <li><strong>Frontend:</strong> Vercel or Netlify (free tier available)</li>
              <li><strong>Backend + Database:</strong> Render, Railway, or DigitalOcean ($5-15/month)</li>
            </ul>

            <h2>7. MVP Scope</h2>

            <div className="not-prose grid md:grid-cols-2 gap-6 my-8">
              <div className="border border-green-500 p-6 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-3">✓ What&apos;s IN</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>✓ Single-user accounts</li>
                  <li>✓ Field management</li>
                  <li>✓ Crop planning (multiple crops per field)</li>
                  <li>✓ Budget planning with 7 core categories</li>
                  <li>✓ Manual actual expense entry</li>
                  <li>✓ Budget vs actual reporting</li>
                  <li>✓ Basic dashboard</li>
                  <li>✓ Responsive web design</li>
                </ul>
              </div>
              <div className="border border-orange-500 p-6 rounded-lg">
                <h3 className="font-semibold text-orange-700 mb-3">⊗ Future Phases</h3>
                <ul className="space-y-2 text-sm text-muted">
                  <li>⊗ Multi-user/team collaboration</li>
                  <li>⊗ Custom fertilizer blending</li>
                  <li>⊗ Soil test integration</li>
                  <li>⊗ Crop application templates</li>
                  <li>⊗ Accounting software integration</li>
                  <li>⊗ Weather data integration</li>
                  <li>⊗ Historical trend analysis</li>
                  <li>⊗ Mobile native apps</li>
                </ul>
              </div>
            </div>

            <h2>8. Success Criteria for MVP Launch</h2>

            <p><strong>Must Have Before Launch:</strong></p>
            <ul>
              <li>All core features functional</li>
              <li>Tested on Chrome, Safari, Firefox</li>
              <li>Tested on mobile devices (iOS and Android)</li>
              <li>Basic error handling and user feedback</li>
              <li>Privacy policy and terms of service</li>
            </ul>

            <p><strong>Success Indicators (3 months post-launch):</strong></p>
            <ul>
              <li>50+ active users</li>
              <li>Average of 3+ crop plantings per user</li>
              <li>70%+ users return to app at least weekly during growing season</li>
              <li>&lt; 5% critical bug rate</li>
            </ul>

            <h2>9. Development Timeline</h2>

            <div className="not-prose space-y-4 my-8">
              <div className="border-l-4 border-gray-900 pl-4">
                <h4 className="font-semibold">Phase 1: Foundation (Weeks 1-2)</h4>
                <p className="text-sm text-muted">Database schema, authentication, basic UI framework</p>
              </div>
              <div className="border-l-4 border-gray-900 pl-4">
                <h4 className="font-semibold">Phase 2: Core Features (Weeks 3-5)</h4>
                <p className="text-sm text-muted">Field management, crop planning, budget creation</p>
              </div>
              <div className="border-l-4 border-gray-900 pl-4">
                <h4 className="font-semibold">Phase 3: Tracking & Reporting (Weeks 6-7)</h4>
                <p className="text-sm text-muted">Expense entry, calculations, reporting views</p>
              </div>
              <div className="border-l-4 border-gray-900 pl-4">
                <h4 className="font-semibold">Phase 4: Polish & Testing (Week 8)</h4>
                <p className="text-sm text-muted">Responsive design, bug fixes, user testing</p>
              </div>
            </div>

            <p><strong>Total Timeline: 8 weeks to functional MVP</strong></p>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="container-std py-8 text-sm text-muted flex items-center justify-between">
          <div>© Switchback Labs — Fort Collins, CO</div>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
