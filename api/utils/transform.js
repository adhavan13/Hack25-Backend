const results = {};
function transformProjectSummary(projects) {
  for (const project of projects) {
    if (!results[project.sector]) {
      results[project.sector] = {
        name: project.sector,
        total_projects: 0,
        planned: 0,
        ongoing: 0,
        completed: 0,
        budget_allocated: 0,
        budget_spent: 0,
      };
    }
    results[project.sector].total_projects += 1;
    results[project.sector].name = project.sector;
    results[project.sector].budget_allocated += project.allocated_budget;
    results[project.sector].budget_spent += project.current_amount_spent;
    if (project.status === "Planned") {
      results[project.sector].planned += 1;
    } else if (project.status === "Ongoing") {
      results[project.sector].ongoing += 1;
    } else if (project.status === "Completed") {
      results[project.sector].completed += 1;
    }
  }
  const satisfactionData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
    (month) => {
      const score = +(7 + Math.random() * 1.5).toFixed(1); // random score between 7.0 - 8.5
      const target = 8.0;
      return { month, score, target };
    }
  );

  // Generate metrics
  const totalAllocated = Object.values(results).reduce(
    (sum, c) => sum + c.budget_allocated,
    0
  );
  const totalSpent = Object.values(results).reduce(
    (sum, c) => sum + c.budget_spent,
    0
  );
  const transparencyPercentage = Math.floor(80 + Math.random() * 10); // 80-90%
  const complaintResolutionPercentage = Math.floor(85 + Math.random() * 10); // 85-95%
  const onTimeTrendPercentage = +(Math.random() * 10 - 5).toFixed(1); // -5% to +5%
  const budgetTrendPercentage = +(-5 + Math.random() * 5).toFixed(1); // -5% to 0%
  const projectTrendPercentage = +(Math.random() * 5).toFixed(1); // 0-5%
  const categoryTrendPercentage = +(Math.random() * 3).toFixed(1); // 0-3%
  const efficiencyTrendPercentage = +(2 + Math.random() * 2).toFixed(1); // 2-4%

  const metrics = {
    transparencyPercentage,
    complaintResolutionPercentage,
    onTimeTrendPercentage,
    budgetTrendPercentage,
    projectTrendPercentage,
    categoryTrendPercentage,
    efficiencyTrendPercentage,
  };
  results["satisfactionData"] = satisfactionData;
  results["metrics"] = metrics;
  return results;
}

module.exports = { transformProjectSummary };
