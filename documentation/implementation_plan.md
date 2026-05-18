# Neural Networks Field Course Implementation Plan

## Implementation Strategy

Rebuild the current prototype around a focused 3Blue1Brown-style visual course. The first implementation should prioritize the first five lessons and remove the feeling of disconnected widgets. Each lesson should have a central animated scene, controls that directly manipulate that scene, and short prompts with optional deeper explanations.

## Phase 1: Reset Course Shell

Goals:

- Replace the current broad course page with a focused five-lesson foundation course.
- Create a layout that supports one primary visual scene per lesson.
- Make navigation simple and lesson-focused.

Tasks:

- Create a lesson data model with title, prompt, explanation, and advanced notes.
- Build `CourseShell`.
- Build `LessonStage`.
- Build `ControlsDock`.
- Build `ExplanationDrawer`.
- Update the homepage to render the focused lesson sequence.
- Temporarily remove or de-emphasize later architecture sections.

Deliverables:

- A clean course shell.
- Five lesson anchors.
- Consistent prompt and explanation pattern.

## Phase 2: Visual Primitive System

Goals:

- Establish reusable animated pieces for the visual language.
- Keep visual behavior consistent across lessons.

Components:

- `NeuronNode`
- `InputNode`
- `OutputNode`
- `SignalEdge`
- `SignalParticle`
- `WeightedConnection`
- `FormulaTrace`
- `ActivationGraph`
- `DecisionPlane`
- `LearnStepButton`

Implementation notes:

- Prefer SVG for visual math scenes.
- Use React state for deterministic control values.
- Use CSS transitions for glow, edge thickness, and region changes.
- Use minimal timed animation for signal pulses.
- Keep component dimensions stable with fixed viewboxes and responsive containers.

Deliverables:

- Reusable visual primitives.
- Shared color/sign conventions.
- Demo scene proving signal flow works.

## Phase 3: Lesson 1 - Neuron Weighted Vote

Goal:

Teach `z = w1x1 + w2x2 + b` as visible signal aggregation.

Scene:

- Three input nodes on the left.
- One neuron in the center.
- One output node on the right.
- Weighted edges connect inputs to neuron.
- Bias appears as an extra threshold marker or bias input.

Controls:

- Input value sliders.
- Weight sliders.
- Bias slider.
- Pulse animation trigger.

Visual behavior:

- Input node brightness follows input value.
- Edge thickness follows absolute weight.
- Edge color indicates positive or negative weight.
- Signal particle intensity changes as it travels.
- Neuron shows weighted sum value and glow.
- Formula trace highlights each term as the pulse arrives.

Acceptance criteria:

- Student can see which input matters most.
- Changing a weight visibly changes edge strength and neuron score.
- Changing bias visibly shifts the neuron's firing tendency.

## Phase 4: Lesson 2 - Activation Behavior

Goal:

Teach activation as the transformation from raw score to output.

Scene:

- Same neuron from Lesson 1 feeding into a large activation graph.
- Moving point on the activation curve.
- Output glow follows activated value.

Controls:

- Activation toggle: step, sigmoid, ReLU.
- Input/weight/bias controls inherited or summarized.
- Send pulse action.

Visual behavior:

- Raw `z` moves horizontally on the graph.
- Activated output moves vertically on the curve.
- Step activation jumps.
- Sigmoid smoothly saturates.
- ReLU clips negative values and passes positive values.

Acceptance criteria:

- Student can distinguish score from activation.
- Student can explain why nonlinear activation changes behavior.

## Phase 5: Lesson 3 - Perceptron Geometry

Goal:

Teach the decision boundary as the set of points where the neuron is undecided.

Scene:

- 2D plane with draggable or clickable data points.
- Decision boundary from `w1x + w2y + b = 0`.
- Two softly colored regions: fires and does not fire.
- Small side neuron shows selected point flowing through equation.

Controls:

- Weight controls rotate the boundary.
- Bias control shifts the boundary.
- Point selection.
- Challenge mode toggle.

Visual behavior:

- Boundary rotates and shifts smoothly.
- Selecting a point shows `x`, `y`, score, and classification.
- Misclassified points are visually marked.
- Challenge mode asks learner to separate clusters.

Acceptance criteria:

- Student understands why a line appears.
- Student connects the formula to geometry.
- Student sees the limitation of one straight boundary.

## Phase 6: Lesson 4 - Tiny Network Boundary Composer

Goal:

Teach hidden layers as combinations of simple boundaries.

Scene:

- Two or three hidden perceptrons feed one output neuron.
- Each hidden neuron has its own boundary on a shared plane.
- Combined output region appears as an overlay.

Controls:

- Show individual boundaries.
- Show combined region.
- Adjust hidden weights.
- Toggle simple examples such as AND, OR, XOR-like layouts.

Visual behavior:

- Each hidden neuron lights up in its region.
- Output combines hidden activations.
- Combined boundary becomes more expressive than a single line.

Acceptance criteria:

- Student can explain why multiple neurons are more powerful than one.
- Student sees hidden neurons as feature detectors.

## Phase 7: Lesson 5 - Loss And Backpropagation Intuition

Goal:

Teach backpropagation as error-driven weight adjustment.

Scene:

- Tiny network predicts an output.
- Target marker shows desired output.
- Loss shown as visible distance.
- Error pulse travels backward along connections.

Controls:

- Target selector.
- Learning rate slider.
- Learn one step button.
- Auto-train toggle.

Visual behavior:

- Prediction moves after learning.
- Edges pulse backward in proportion to update size.
- Weight labels visibly update.
- Loss decreases over repeated steps when possible.

Acceptance criteria:

- Student understands that training changes weights.
- Student understands that backpropagation assigns directional updates.
- Student sees learning rate as step size.

## Phase 8: Explanation And Advanced Panels

Goals:

- Keep the main path visual and light.
- Preserve rigor for university students.

Tasks:

- Add "Show explanation" drawer to each lesson.
- Add "Advanced math" drawer where relevant.
- For advanced panels, include concise derivations:
  - weighted sum and activation notation
  - perceptron boundary equation
  - loss function
  - gradient descent update
  - chain rule intuition

Acceptance criteria:

- Main lesson remains readable without opening panels.
- Advanced content is discoverable and useful.

## Phase 9: Visual Polish And Accessibility

Goals:

- Make the course feel playful, animated, and legible.
- Ensure controls are usable and text does not collide.

Tasks:

- Tune color contrast.
- Add reduced-motion support.
- Add clear focus states.
- Add ARIA labels for controls and diagrams.
- Verify desktop, tablet, and mobile layouts.
- Ensure SVG text and labels do not overflow.
- Add empty or reset states where needed.

Acceptance criteria:

- Page is readable at common viewport sizes.
- Controls are keyboard-accessible.
- Animations clarify the concept.

## Phase 10: Verification

Required checks:

- `npm run lint`
- `npm run build`
- Localhost render check.
- Browser visual review.
- Interact with:
  - neuron sliders
  - activation toggle
  - perceptron controls
  - explanation drawers
  - learn one step button

Visual review checklist:

- Are controls visually connected to the thing they affect?
- Is the main idea visible before reading the explanation?
- Does each formula map to a visible object?
- Are animations meaningful rather than decorative?
- Is the page readable without zooming?

## Suggested File Structure

```text
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  components/
    course/
      course-shell.tsx
      lesson-stage.tsx
      controls-dock.tsx
      explanation-drawer.tsx
    visuals/
      activation-graph.tsx
      decision-plane.tsx
      formula-trace.tsx
      neuron-node.tsx
      signal-edge.tsx
      signal-particle.tsx
      weighted-connection.tsx
    lessons/
      neuron-weighted-vote.tsx
      activation-behavior.tsx
      perceptron-geometry.tsx
      tiny-network-boundary.tsx
      backprop-intuition.tsx
  lib/
    math.ts
    lessons.ts
```

## Build Priority

1. Course shell and visual primitive system.
2. Lesson 1 and Lesson 2 as one polished neuron-to-activation flow.
3. Lesson 3 perceptron geometry.
4. Lesson 4 tiny network.
5. Lesson 5 backprop intuition.
6. Advanced drawers and polish.

## Definition Of Done For First Rebuild

- The site focuses on the first five lessons only.
- Each lesson has a primary animated visual.
- Controls manipulate visible mathematical objects.
- Text is short by default.
- Deeper explanations are available but collapsed.
- Lint and build pass.
- The localhost site has been visually checked.
