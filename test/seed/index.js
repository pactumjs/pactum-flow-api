const db = require('../component/helpers/db');

async function seed() {
  await db.clean();
  await db.createProject('team1_project-one', '[Team1] Project One');
  await db.createAnalysis('team1_project-one', '1.0.1', 't-1-p-1-a-1');
  await db.createFlow('flow one', 't-1-p-1-a-1');
  await db.createInteraction('team1_project-two', 'flow two', 't-1-p-1-a-1');
  await db.processAnalysis('t-1-p-1-a-1');
  await db.createProject('team1_project-two', '[Team1] Project Two');
  await db.createAnalysis('team1_project-two', '2.0.1', 't-1-p-1-a-2');
  await db.createFlow('flow two', 't-1-p-1-a-2');
  await db.processAnalysis('t-1-p-1-a-2');
  await db.createProject('team2_project-one', '[Team2] Project One');
}

seed().then().catch(err => console.log(err));