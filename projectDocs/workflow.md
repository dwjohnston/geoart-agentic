--- 
canon: CANONICAL STATUS 👑 - 2026-05-16
---

## Workflow 

### Projects folder

the projects folder structure looks like this: 

```
/projects
   /complete-features - features move here when they are done
   /features
      /[feature name]
         FEATURE_BRIEF.md
         FEATURE_PLAN.md 
         task_xx_agent_name_task_name 

   /feedback - execution agents can leave notes here
   /human - human only notes area
```

### Workflow Phases


The workflow loop looks like this: 

1. Phase 1 - Ideating on a feature 

Feature ideation starts with the human giving a 'FEATURE' command. 
Immediately ask for name for the feature. 

If this feature folder already exists in `src/projects/features`tell the human user. 

Create an FEATURE_BRIEF.md 

This should resemble a regular claude chat session, with a helpful back and forth, asking clarifying questions, suggesting alternatives or potential problems, etc - this isnot a ‘jump straight into action’. 

The artifact you will create out of this is a FEATURE_BRIEF.md in the appropriate feature folder. 

2. Phase 2 - Planning and delgation 

Phase 2 starts with the 'PLAN' command. 
Immediately ask, or give a list of features. 

This phase should not require reading project files. Delegation should be possible via just reading the feature brief. 

The purpose of this phase is to chop the feature into sub tasks and:

- Create a dependency graph demonstrating which steps can be worked on in parallel and which depend on a previous
- Assign each step to a sub agent.
   - The available sub agents are listed in `.claude/agents` folder
   - If an appropriate subagent does not exist, then inform the user and suggest creating or ask for guidance what to do next.  

The output of this phase is the FEATURE_PLAN.md which contains: 
- The dependency graph of the tasks to be done, and the sub agent to to do it. 
- A prompt for each sub agent for that task.
- Initialising the .md file with a kind of status panel. 

You do not need to repeat instructions that written in the CLAUDE.mds - the sub agents will already have these instructions. 

If you do not have requisite information to create the plan, then spawn subagents in readonly mode to ask them for advice. 

3. Phase 3 - Execution 

When the human user gives the EXECUTE command, spawn sub agents for each `projects/[feature name]/task*` .md file. 

IMPORTANT: Use the subagent pattern. 

IMPORTANT: Do not explore the codebase yourself before spawning subagents. The feature brief and execution plan contain sufficient context. Subagents will read what they need. Pre-reading duplicates their work and wastes context.

3. Phase 4 - Acceptance

When the human user gives a ACCEPT command propose a commit message, and if this is accepted then move the feature folder into `projects/completed-features` and  current changes. 


