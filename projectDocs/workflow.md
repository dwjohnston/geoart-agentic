## Workflow 


The workflow loop looks like this: 

1. Phase 1 - Ideating on a feature 

Phase 1 is performed by `ideation-agent`.

Feature ideation starts with the human giving a 'FEATURE' command. 
Immediately ask for name for the feature. 
Create a md file with this name in the `project/staging` folder. If a feature with a matching name already exists - tell the human user. 

This should resemble a regular claude chat session, with a helpful back and forth, not a ‘jump straight into action’. 


The artifact you will create out of this is a .md file in the `project/staging` folder. 

1b. Iterate


2. Phase 2 - Planning and delgation 

Phase 2 is performed by `planning-agent`.

Phase 2 starts with the 'PLAN' command. 
Immediately ask, or give a list of staged features. 

At this point the AI is directed to read one of the `projects/staging` .md files, and from here create a plan.md in the `projects/execution` folder.

This phase should not require reading project files. Delegation should be possible via just reading the feature brief. 

The purpose of this phase is to chop the feature into sub tasks and:

- Create a dependency graph demonstrating which steps can be worked on in parallel and which depend on a previous
- Assign each step to a sub agent.
   - The available sub agents are listed in `.claude/agents` folder
   - If an appropriate subagent does not exist, then inform the user and suggest creating or ask for guidance what to do next.  

The output of this phase is the plan.md which contains: 
- The dependency graph of the tasks to be done, and the sub agent to to do it. 
- A prompt for each sub agent for that task.
- Initialising the .md file with a kind of status panel. 

You do not need to repeat instructions that written in the CLAUDE.mds - the sub agents will already have these instructions. 

If needed the AI that is creating the plan.md may need to spawn sub agents to 
have them assist in the creation of prompts and the dependency graph. 

3. Phase 3 - Execution 

When the human user gives the EXECUTE command, start implementing the feature as described in the corresponding `projects/execution` .md file. 

IMPORTANT: Use the subagent pattern. Decompose the task into as many items as there are in the execution .md file's status panel. 

IMPORTANT: Do not explore the codebase yourself before spawning subagents. The feature brief and execution plan contain sufficient context. Subagents will read what they need. Pre-reading duplicates their work and wastes context.

3b. Iterate

3. Phase 4 - Acceptance

Phase 4 is performed by `ideation-agent`.


When the human user gives a ACCEPT command propose a commit message, and if this is accepted then move the plan.md into `projects/archived.md` and  current changes. 

Important: The human user may forget to give the START FEATURE, EXECUTE and ACCEPT commands. In this scenario NEVER make any code changes. 
Exception: You can always sign a guestbook if requested. 

You can however answer questions in the chat prompt.

### Escape hatch - QUICK

Sometimes the above workflow is a bit cumbersome. If the human prefixes a statement with QUICK then treat this as a one time task. 

If in the middle of a phase, clarify if things should be parked first. 

And the end of a QUICK task then request acceptance, and then propose a commit message. 


