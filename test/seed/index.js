const db = require('../component/helpers/db');

async function seed() {
  await db.clean();
  // consumer project - with a hidden provider
  await db.createProject('project-one', 'Project One');
  await db.createAnalysis('project-one', '1.0.1', 'p-1-a-1');
  await db.createInteraction('project-two', 'flow two', 'p-1-a-1');
  await db.processAnalysis('p-1-a-1');
  // provider project - with a consumer
  await db.createProject('project-two', 'Project Two');
  await db.createAnalysis('project-two', '2.0.1', 'p-2-a-1');
  await db.createFlow('flow two', 'p-2-a-1');
  await db.processAnalysis('p-2-a-1');

  // consumer project - without a provider
  await db.createProject('project-three', 'Project Three');
  await db.createAnalysis('project-three', '3.0.1', 'p-3-a-1');
  await db.createInteraction('team_NA_project-two', 'flow NA two', 'p-3-a-1');
  await db.processAnalysis('p-3-a-1');

  // provider project - with a hidden consumer
  await db.createProject('project-four', 'Project Four');
  await db.createAnalysis('project-four', '4.0.1', 'p-4-a-1');
  await db.createFlow('flow four', 'p-4-a-1');
  await db.processAnalysis('p-4-a-1');
  // consumer project - with a provider
  await db.createProject('project-five', 'Project Five');
  await db.createAnalysis('project-five', '5.0.1', 'p-5-a-1');
  await db.createInteraction('project-four', 'flow four', 'p-5-a-1');
  await db.processAnalysis('p-5-a-1');

  // provider & consumer project
  await db.createProject('project-six', 'Project Six');
  await db.createAnalysis('project-six', '6.0.1', 'p-6-a-1');
  await db.createFlow('flow six', 'p-6-a-1');
  await db.createInteraction('project-seven', 'flow seven', 'p-6-a-1');
  await db.processAnalysis('p-6-a-1');
  // provider & consumer project
  await db.createProject('project-seven', 'Project Seven');
  await db.createAnalysis('project-seven', '7.0.1', 'p-7-a-1');
  await db.createFlow('flow seven', 'p-7-a-1');
  await db.createInteraction('project-six', 'flow six', 'p-7-a-1');
  await db.processAnalysis('p-7-a-1');
  // run project six analysis once again
  await db.createAnalysis('project-six', '6.0.2', 'p-6-a-2');
  await db.createFlow('flow six', 'p-6-a-2');
  await db.createInteraction('project-seven', 'flow seven', 'p-6-a-2');
  await db.processAnalysis('p-6-a-2');

  // provider project - with failing compatibility
  await db.createProject('project-8', 'Project 8');
  await db.createAnalysis('project-8', '8.0.1', 'p-8-a-1');
  await db.createFlow('flow 8', 'p-8-a-1', {
    request: {
      method: 'GET',
      path: '/api/v2'
    }
  });
  await db.processAnalysis('p-8-a-1');
  // provider project - with failing compatibility
  await db.createProject('project-9', 'Project 9');
  await db.createAnalysis('project-9', '9.0.1', 'p-9-a-1');
  await db.createInteraction('project-8', 'flow 8', 'p-9-a-1');
  await db.createInteraction('project-8', 'flow 8.2', 'p-9-a-1');
  await db.processAnalysis('p-9-a-1');

  // project without analysis
  await db.createProject('project-end', 'Project End');

  await db.saveProjectInEnvironment('dev', 'project-one', '1.0.1');
  await db.saveProjectInEnvironment('dev', 'project-six', '6.0.2');
}

seed().then().catch(err => console.log(err));