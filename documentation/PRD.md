# Neural Networks Field Course PRD

## Purpose

Build a self-contained interactive education website that teaches university students the visual intuition behind neural networks. The course should feel like a 3Blue1Brown-style explainer with direct controls: students manipulate signals, weights, activations, boundaries, and learning steps while the math moves on screen.

## Audience

- University students learning neural networks for the first time.
- Students may have introductory calculus, linear algebra, or programming exposure, but the main course path should not require advanced derivations.
- The site should support students who want rigor through optional deeper explanation panels.

## Product Goals

- Make neural network concepts visually legible before presenting dense text.
- Connect formulas to animated visual objects.
- Focus the first release on foundational intuition rather than covering every architecture superficially.
- Preserve advanced math as opt-in content.
- Keep the site local and self-contained for now, with no accounts, saved progress, or backend.

## Non-Goals

- No authentication or persistent user progress.
- No instructor dashboard.
- No assignment submission system.
- No full production LMS behavior.
- No exhaustive coverage of all neural network architectures in the first visual prototype.

## Course Scope For First Release

The first release should cover five focused lessons:

1. A Neuron Takes a Weighted Vote
2. Activation Turns Scores into Behavior
3. A Perceptron Draws a Boundary
4. A Tiny Network Bends the Boundary
5. Loss and Backpropagation Intuition

Later topics such as CNNs, RNNs, LSTMs, autoencoders, VAEs, and GANs should be deferred until the foundational visual language is strong.

## Experience Principles

- One main visual scene per lesson.
- Controls must directly affect the visual scene.
- Short prompts should guide the learner through interaction.
- Deeper explanations should be hidden behind expandable panels.
- Formulas should be synchronized with the visual representation.
- Animations should show cause and effect, not just decorate the page.
- Text should support the visual, not replace it.

## Visual Language

- Inputs are animated signal particles or nodes.
- Weights are edge thickness, color, and sign.
- Positive weights amplify or brighten signals.
- Negative weights suppress, invert, or color-shift signals.
- Bias appears as a threshold shift or boundary offset.
- Activation appears as a graph with a moving point and neuron glow.
- Perceptron boundaries appear as the geometric result of the neuron equation.
- Backpropagation appears as error flowing backward along weighted connections.

## Lesson Requirements

### Lesson 1: A Neuron Takes a Weighted Vote

Students should understand that a neuron computes a weighted sum plus bias.

Required features:

- Input nodes feeding one neuron.
- Animated signal flow from inputs to neuron.
- Sliders for input values, weights, and bias.
- Visual formula trace for `z = w1x1 + w2x2 + b`.
- Edge thickness/color changes as weights change.
- Neuron glow changes as the weighted sum changes.

### Lesson 2: Activation Turns Scores into Behavior

Students should understand that activation functions transform a raw score into an output behavior.

Required features:

- Activation graph with moving point.
- Toggle for step, sigmoid, and ReLU.
- Output node intensity follows activation result.
- "Send pulse" action to animate a signal through the neuron and graph.
- Optional explanation of why nonlinear activation matters.

### Lesson 3: A Perceptron Draws a Boundary

Students should understand that a perceptron creates a decision boundary because all points satisfying `w1x + w2y + b = 0` are exactly undecided.

Required features:

- 2D coordinate plane with labeled points.
- Decision boundary rendered from weights and bias.
- Colored decision regions for "fires" and "does not fire."
- Clickable points that show their score flowing through the neuron equation.
- Controls for weights and bias.
- Mini challenge mode to separate point clusters.

### Lesson 4: A Tiny Network Bends the Boundary

Students should understand that multiple neurons can combine simple boundaries into more expressive decision regions.

Required features:

- Small network with hidden neurons and one output neuron.
- Each hidden neuron maps to a simple boundary.
- Combined decision region updates as hidden units change.
- Toggle to show individual vs combined boundaries.
- Short explanation of hidden layers as feature builders.

### Lesson 5: Loss and Backpropagation Intuition

Students should understand that training means measuring error and adjusting weights in the direction that reduces it.

Required features:

- Prediction vs target visual.
- Loss shown as distance or area.
- Backward error pulse across connections.
- "Learn one step" button.
- Learning rate control.
- Weight updates visible after each step.
- Optional advanced explanation of gradient descent and the chain rule.

## Content Structure

Each lesson should include:

- Short title.
- One-sentence prompt.
- Primary animated visual.
- Small control dock.
- Formula trace where relevant.
- "Show explanation" drawer.
- Optional "Advanced math" drawer.

## Design Requirements

- Playful animated style.
- High contrast and readable typography.
- No dense text blocks in the default view.
- Responsive layout for desktop and tablet first, with mobile support.
- Stable visual dimensions to avoid layout shifting during animations.
- Controls should be close to the visual they affect.

## Technical Requirements

- Next.js App Router.
- React and TypeScript.
- SVG-based visualizations for math diagrams.
- Tailwind CSS for styling.
- Local state for controls and simulations.
- No backend required.
- Must pass lint and production build.

## Success Criteria

A student should be able to explain:

- What a weight does.
- What a bias does.
- Why activation functions matter.
- Why a perceptron creates a line.
- Why one perceptron is limited.
- Why hidden layers improve expressiveness.
- What backpropagation is trying to adjust.

The first release is successful if these ideas are visually obvious before the student opens the deeper explanations.
