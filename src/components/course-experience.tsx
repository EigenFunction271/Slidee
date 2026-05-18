"use client";

import { useMemo, useState } from "react";

type ActivationKind = "step" | "sigmoid" | "relu";
type XY = { x: number; y: number };

const lessons = [
  {
    id: "weighted-vote",
    tag: "01",
    title: "A Neuron Takes a Weighted Vote",
    prompt: "Change a weight. Watch one input become louder or quieter.",
  },
  {
    id: "activation",
    tag: "02",
    title: "Activation Turns Scores into Behavior",
    prompt: "The score is raw. The activation decides how the neuron responds.",
  },
  {
    id: "perceptron",
    tag: "03",
    title: "A Perceptron Draws a Boundary",
    prompt: "The line is every point where the neuron is exactly undecided.",
  },
  {
    id: "tiny-network",
    tag: "04",
    title: "A Tiny Network Bends the Boundary",
    prompt: "One line is limited. Several neurons can carve a richer shape.",
  },
  {
    id: "backprop",
    tag: "05",
    title: "Loss and Backpropagation Intuition",
    prompt: "Learning means moving each weight in the direction that reduces error.",
  },
];

const trainingPoints = [
  { id: "a", x: -2.2, y: 1.7, label: 0 },
  { id: "b", x: -1.4, y: -1.5, label: 0 },
  { id: "c", x: -0.4, y: 2.2, label: 0 },
  { id: "d", x: 0.9, y: 1.3, label: 1 },
  { id: "e", x: 1.8, y: -0.2, label: 1 },
  { id: "f", x: 2.3, y: -1.7, label: 1 },
];

const xorPoints = [
  { id: "nw", x: -1.8, y: 1.8, label: 1 },
  { id: "ne", x: 1.8, y: 1.8, label: 0 },
  { id: "sw", x: -1.8, y: -1.8, label: 0 },
  { id: "se", x: 1.8, y: -1.8, label: 1 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function activationValue(kind: ActivationKind, z: number) {
  if (kind === "step") return z >= 0 ? 1 : 0;
  if (kind === "relu") return Math.max(0, z);
  return 1 / (1 + Math.exp(-z));
}

function format(value: number) {
  return value.toFixed(2);
}

export function CourseExperience() {
  const [inputs, setInputs] = useState([0.8, -0.35, 0.55]);
  const [weights, setWeights] = useState([1.25, -0.9, 0.6]);
  const [bias, setBias] = useState(0.15);
  const [activation, setActivation] = useState<ActivationKind>("sigmoid");
  const [pulse, setPulse] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState("d");
  const [boundary, setBoundary] = useState({ w1: 1.05, w2: -0.9, b: 0.1 });
  const [hiddenScale, setHiddenScale] = useState(1);
  const [target, setTarget] = useState(1);
  const [learnWeights, setLearnWeights] = useState([0.45, -0.75]);
  const [learnBias, setLearnBias] = useState(0.1);
  const [learningRate, setLearningRate] = useState(0.35);
  const [pulseBack, setPulseBack] = useState(0);

  const z = inputs.reduce((sum, input, index) => sum + input * weights[index], bias);
  const output = activationValue(activation, z);
  const selected = trainingPoints.find((point) => point.id === selectedPoint) ?? trainingPoints[3];
  const selectedScore = boundary.w1 * selected.x + boundary.w2 * selected.y + boundary.b;
  const selectedPrediction = selectedScore >= 0 ? 1 : 0;
  const learnInput = [0.85, 0.35];
  const learnZ = learnInput[0] * learnWeights[0] + learnInput[1] * learnWeights[1] + learnBias;
  const learnPrediction = activationValue("sigmoid", learnZ);
  const loss = 0.5 * (target - learnPrediction) ** 2;

  function updateInput(index: number, value: number) {
    setInputs((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function updateWeight(index: number, value: number) {
    setWeights((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function learnOneStep() {
    const error = learnPrediction - target;
    const localGradient = learnPrediction * (1 - learnPrediction);
    const gradient = error * localGradient;
    setLearnWeights((current) =>
      current.map((weight, index) => weight - learningRate * gradient * learnInput[index]),
    );
    setLearnBias((current) => current - learningRate * gradient);
    setPulseBack((current) => current + 1);
  }

  return (
    <main className="min-h-screen bg-[#10100f] text-[#fff8e8]">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="top-4 h-fit rounded-lg border border-white/10 bg-[#181714] p-4 lg:sticky">
          <div className="mb-5">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6de0d2]">
              Neural Networks
            </p>
            <h1 className="mt-2 text-2xl font-black leading-tight">Visual Field Course</h1>
            <p className="mt-3 text-sm leading-6 text-[#cfc5ac]">
              Five focused lessons for building intuition before derivation.
            </p>
          </div>
          <nav className="space-y-2" aria-label="Course lessons">
            {lessons.map((lesson) => (
              <a
                key={lesson.id}
                href={`#${lesson.id}`}
                className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-[#f7cf5f]/60 hover:bg-white/[0.07]"
              >
                <span className="font-mono text-xs font-black text-[#f7cf5f]">{lesson.tag}</span>
                <span className="mt-1 block text-sm font-black">{lesson.title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 space-y-5">
          <HeroPanel onPulse={() => setPulse((current) => current + 1)} />

          <LessonStage lesson={lessons[0]} tone="dark">
            <NeuronWeightedVoteScene
              inputs={inputs}
              weights={weights}
              bias={bias}
              z={z}
              pulse={pulse}
            />
            <ControlsDock>
              {inputs.map((input, index) => (
                <RangeControl
                  key={`input-${index}`}
                  label={`input x${index + 1}`}
                  value={input}
                  min={-1.5}
                  max={1.5}
                  step={0.05}
                  onChange={(value) => updateInput(index, value)}
                />
              ))}
              {weights.map((weight, index) => (
                <RangeControl
                  key={`weight-${index}`}
                  label={`weight w${index + 1}`}
                  value={weight}
                  min={-2.5}
                  max={2.5}
                  step={0.05}
                  onChange={(value) => updateWeight(index, value)}
                />
              ))}
              <RangeControl label="bias b" value={bias} min={-2} max={2} step={0.05} onChange={setBias} />
              <button
                className="rounded-md bg-[#f7cf5f] px-4 py-3 text-sm font-black text-[#17130d] transition hover:bg-[#ffe18a]"
                onClick={() => setPulse((current) => current + 1)}
              >
                Send signal pulse
              </button>
            </ControlsDock>
            <ExplanationDrawer
              title="What this shows"
              body="Each edge carries an input multiplied by its weight. Thicker edges matter more. Teal edges add evidence; coral edges subtract it. The neuron collects those pieces into z, then the next lesson turns z into behavior."
              advanced="The weighted sum is z = w1x1 + w2x2 + w3x3 + b. A positive contribution increases z. A negative contribution decreases z. Bias shifts the score before any input arrives."
            />
          </LessonStage>

          <LessonStage lesson={lessons[1]} tone="light">
            <ActivationBehaviorScene z={z} output={output} activation={activation} pulse={pulse} />
            <ControlsDock>
              <SegmentedControl
                label="activation"
                value={activation}
                options={[
                  { label: "Step", value: "step" },
                  { label: "Sigmoid", value: "sigmoid" },
                  { label: "ReLU", value: "relu" },
                ]}
                onChange={setActivation}
              />
              <RangeControl label="bias b" value={bias} min={-2} max={2} step={0.05} onChange={setBias} />
              <RangeControl label="weight w1" value={weights[0]} min={-2.5} max={2.5} step={0.05} onChange={(value) => updateWeight(0, value)} />
              <button
                className="rounded-md bg-[#25211a] px-4 py-3 text-sm font-black text-white transition hover:bg-[#3b3327]"
                onClick={() => setPulse((current) => current + 1)}
              >
                Animate score
              </button>
            </ControlsDock>
            <ExplanationDrawer
              title="Why activation exists"
              body="The score z is still just a linear vote. Activation turns that score into a useful response: a hard yes or no, a smooth probability-like value, or a positive-only signal."
              advanced="Without nonlinear activations, stacking layers collapses back into one linear transformation. Nonlinearity is what lets deeper networks represent curved and compositional patterns."
            />
          </LessonStage>

          <LessonStage lesson={lessons[2]} tone="dark">
            <PerceptronGeometryScene
              boundary={boundary}
              selected={selected}
              selectedPrediction={selectedPrediction}
              selectedScore={selectedScore}
              selectedPoint={selectedPoint}
              onSelectPoint={setSelectedPoint}
            />
            <ControlsDock>
              <RangeControl
                label="w1 rotates"
                value={boundary.w1}
                min={-2.5}
                max={2.5}
                step={0.05}
                onChange={(value) => setBoundary((current) => ({ ...current, w1: value }))}
              />
              <RangeControl
                label="w2 rotates"
                value={boundary.w2}
                min={-2.5}
                max={2.5}
                step={0.05}
                onChange={(value) => setBoundary((current) => ({ ...current, w2: value }))}
              />
              <RangeControl
                label="bias shifts"
                value={boundary.b}
                min={-3}
                max={3}
                step={0.05}
                onChange={(value) => setBoundary((current) => ({ ...current, b: value }))}
              />
            </ControlsDock>
            <ExplanationDrawer
              title="Why the line exists"
              body="For every point on the line, w1x + w2y + b equals zero. On one side the neuron fires; on the other side it does not. The boundary is not decoration. It is the neuron equation drawn in space."
              advanced="The vector (w1, w2) is perpendicular to the boundary. Changing the weights rotates the normal vector. Changing b translates the boundary without changing its orientation."
            />
          </LessonStage>

          <LessonStage lesson={lessons[3]} tone="light">
            <TinyNetworkScene hiddenScale={hiddenScale} />
            <ControlsDock>
              <RangeControl
                label="hidden boundary spread"
                value={hiddenScale}
                min={0.55}
                max={1.8}
                step={0.05}
                onChange={setHiddenScale}
              />
            </ControlsDock>
            <ExplanationDrawer
              title="How layers compose"
              body="Each hidden neuron still draws a simple boundary. The output neuron combines those hidden yes/no regions into a more flexible decision shape. This is the first glimpse of representation learning."
              advanced="Hidden activations transform the original coordinate system into learned features. The output layer then separates the transformed representation, not the raw input space."
            />
          </LessonStage>

          <LessonStage lesson={lessons[4]} tone="dark">
            <BackpropScene
              input={learnInput}
              weights={learnWeights}
              bias={learnBias}
              prediction={learnPrediction}
              target={target}
              loss={loss}
              pulse={pulseBack}
            />
            <ControlsDock>
              <SegmentedControl
                label="target"
                value={String(target)}
                options={[
                  { label: "0", value: "0" },
                  { label: "1", value: "1" },
                ]}
                onChange={(value) => setTarget(Number(value))}
              />
              <RangeControl
                label="learning rate"
                value={learningRate}
                min={0.05}
                max={1}
                step={0.05}
                onChange={setLearningRate}
              />
              <button
                className="rounded-md bg-[#f7cf5f] px-4 py-3 text-sm font-black text-[#17130d] transition hover:bg-[#ffe18a]"
                onClick={learnOneStep}
              >
                Learn one step
              </button>
            </ControlsDock>
            <ExplanationDrawer
              title="What backprop is doing"
              body="The target says where the output should be. The loss measures how far away the prediction is. One learning step sends that error backward and nudges the weights that produced it."
              advanced="For sigmoid output with squared error, the local update is proportional to (prediction - target) * prediction * (1 - prediction) * input. The learning rate scales the size of the step."
            />
          </LessonStage>
        </div>
      </div>
    </main>
  );
}

function HeroPanel({ onPulse }: { onPulse: () => void }) {
  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-[#181714]">
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_360px] lg:p-7">
        <div className="flex flex-col justify-center">
          <p className="w-fit rounded-md bg-[#6de0d2]/15 px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6de0d2]">
            3B1B-style prototype
          </p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] sm:text-6xl">
            Watch the algebra become a machine.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d9cfb8]">
            This rebuild focuses on the first few lessons only. Every control should move a visible
            mathematical object: signals, weights, curves, boundaries, and error.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#weighted-vote"
              className="rounded-md bg-[#f7cf5f] px-4 py-3 text-sm font-black text-[#17130d] transition hover:bg-[#ffe18a]"
            >
              Start with a neuron
            </a>
            <button
              className="rounded-md border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
              onClick={onPulse}
            >
              Send a pulse
            </button>
          </div>
        </div>
        <MiniNetworkPoster />
      </div>
    </section>
  );
}

function LessonStage({
  lesson,
  tone,
  children,
}: {
  lesson: (typeof lessons)[number];
  tone: "dark" | "light";
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section
      id={lesson.id}
      className={`scroll-mt-4 rounded-lg border p-4 sm:p-5 ${
        dark ? "border-white/10 bg-[#181714]" : "border-[#21180f]/10 bg-[#fff8e8] text-[#211c18]"
      }`}
    >
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className={`font-mono text-xs font-black uppercase tracking-[0.18em] ${dark ? "text-[#6de0d2]" : "text-[#137a72]"}`}>
            {lesson.tag}
          </p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{lesson.title}</h2>
        </div>
        <p className={`max-w-xl rounded-md px-3 py-2 text-sm font-bold ${dark ? "bg-white/10 text-[#f5e9cb]" : "bg-[#f1e3c4] text-[#4c4034]"}`}>
          {lesson.prompt}
        </p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ControlsDock({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 rounded-lg bg-black/[0.08] p-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-md border border-black/10 bg-white p-3 text-[#211c18] shadow-sm">
      <span className="flex items-center justify-between gap-3 text-sm font-black">
        {label}
        <span className="font-mono text-[#137a72]">{format(value)}</span>
      </span>
      <input
        aria-label={label}
        className="mt-3 w-full accent-[#ef6a45]"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-md border border-black/10 bg-white p-3 text-[#211c18] shadow-sm">
      <p className="mb-2 text-sm font-black">{label}</p>
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            className={`rounded px-2 py-2 text-sm font-black transition ${
              option.value === value ? "bg-[#137a72] text-white" : "bg-[#f3ead8] hover:bg-[#ead9b9]"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExplanationDrawer({ title, body, advanced }: { title: string; body: string; advanced: string }) {
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="rounded-lg border border-current/10 bg-white/[0.06] p-3">
      <button className="flex w-full items-center justify-between gap-3 text-left font-black" onClick={() => setOpen((value) => !value)}>
        <span>{open ? "Hide explanation" : "Show explanation"}</span>
        <span className="font-mono">{open ? "-" : "+"}</span>
      </button>
      {open ? (
        <div className="mt-3 space-y-3 text-sm leading-6">
          <h3 className="text-lg font-black">{title}</h3>
          <p className="max-w-4xl opacity-85">{body}</p>
          <button
            className="rounded-md border border-current/15 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] opacity-90"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            {advancedOpen ? "Hide advanced" : "Show advanced"}
          </button>
          {advancedOpen ? <p className="max-w-4xl rounded-md bg-black/20 p-3 font-mono text-xs leading-6">{advanced}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function NeuronWeightedVoteScene({
  inputs,
  weights,
  bias,
  z,
  pulse,
}: {
  inputs: number[];
  weights: number[];
  bias: number;
  z: number;
  pulse: number;
}) {
  const inputNodes = [
    { x: 80, y: 90 },
    { x: 80, y: 190 },
    { x: 80, y: 290 },
  ];
  const neuron = { x: 390, y: 190 };
  const output = { x: 650, y: 190 };

  return (
    <VisualFrame dark>
      <svg viewBox="0 0 720 380" className="h-full w-full" role="img" aria-label="Weighted neuron visualizer">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <GridLines dark />
        {inputNodes.map((node, index) => {
          const contribution = inputs[index] * weights[index];
          return (
            <g key={index}>
              <SignalEdge from={node} to={neuron} weight={weights[index]} />
              <SignalPulse key={`${pulse}-${index}`} from={node} to={neuron} delay={index * 0.12} positive={contribution >= 0} />
              <Node x={node.x} y={node.y} label={`x${index + 1}`} value={inputs[index]} active={Math.abs(inputs[index])} />
              <text x="165" y={node.y - 12} className="fill-[#fff8e8] text-[15px] font-bold">
                {format(inputs[index])} x {format(weights[index])}
              </text>
              <text x="165" y={node.y + 12} className={contribution >= 0 ? "fill-[#6de0d2] text-[13px] font-bold" : "fill-[#ff8c6b] text-[13px] font-bold"}>
                contribution {format(contribution)}
              </text>
            </g>
          );
        })}
        <line x1="315" y1="330" x2={neuron.x - 45} y2={neuron.y + 22} stroke="#f7cf5f" strokeWidth="4" strokeDasharray="8 8" />
        <circle cx="315" cy="330" r="28" fill="#f7cf5f" opacity="0.18" />
        <text x="315" y="336" textAnchor="middle" className="fill-[#f7cf5f] text-[16px] font-black">
          b {format(bias)}
        </text>
        <circle cx={neuron.x} cy={neuron.y} r={58 + clamp(Math.abs(z) * 4, 0, 18)} fill="#f7cf5f" opacity={0.12 + clamp(Math.abs(z) / 8, 0, 0.28)} filter="url(#glow)" />
        <circle cx={neuron.x} cy={neuron.y} r="54" fill="#25211a" stroke="#f7cf5f" strokeWidth="4" />
        <text x={neuron.x} y={neuron.y - 8} textAnchor="middle" className="fill-[#fff8e8] text-[20px] font-black">
          neuron
        </text>
        <text x={neuron.x} y={neuron.y + 20} textAnchor="middle" className="fill-[#f7cf5f] text-[18px] font-black">
          z = {format(z)}
        </text>
        <SignalEdge from={neuron} to={output} weight={z} />
        <SignalPulse key={`${pulse}-out`} from={neuron} to={output} delay={0.45} positive={z >= 0} />
        <Node x={output.x} y={output.y} label="z" value={z} active={Math.abs(z) / 2} />
        <FormulaStrip lines={[`z = (${format(inputs[0])})(${format(weights[0])}) + (${format(inputs[1])})(${format(weights[1])}) + (${format(inputs[2])})(${format(weights[2])}) + ${format(bias)}`, `z = ${format(z)}`]} />
      </svg>
    </VisualFrame>
  );
}

function ActivationBehaviorScene({
  z,
  output,
  activation,
  pulse,
}: {
  z: number;
  output: number;
  activation: ActivationKind;
  pulse: number;
}) {
  const curve = useMemo(() => activationPath(activation), [activation]);
  const point = graphPoint(z, output, activation);

  return (
    <VisualFrame>
      <svg viewBox="0 0 720 380" className="h-full w-full" role="img" aria-label="Activation function graph">
        <GridLines />
        <text x="42" y="48" className="fill-[#211c18] text-[24px] font-black">
          activation graph
        </text>
        <line x1="80" y1="300" x2="640" y2="300" stroke="#332820" strokeWidth="2" />
        <line x1="120" y1="330" x2="120" y2="55" stroke="#332820" strokeWidth="2" />
        <path d={curve} fill="none" stroke="#137a72" strokeWidth="5" strokeLinecap="round" />
        <line x1={point.x} y1="300" x2={point.x} y2={point.y} stroke="#ef6a45" strokeWidth="3" strokeDasharray="8 7" />
        <circle key={pulse} cx={point.x} cy={point.y} r="13" fill="#f7cf5f" className="signal-pop" />
        <circle cx={point.x} cy={point.y} r="8" fill="#ef6a45" />
        <text x={point.x} y={point.y - 22} textAnchor="middle" className="fill-[#211c18] text-[14px] font-black">
          z {format(z)}
        </text>
        <text x="560" y="82" className="fill-[#211c18] text-[18px] font-black">
          output {format(output)}
        </text>
        <circle cx="580" cy="190" r={34 + clamp(output * 18, 0, 34)} fill="#f7cf5f" opacity="0.28" />
        <circle cx="580" cy="190" r="38" fill="#fff8e8" stroke="#211c18" strokeWidth="3" />
        <text x="580" y="196" textAnchor="middle" className="fill-[#211c18] text-[18px] font-black">
          y
        </text>
        <FormulaStrip lines={[`${activation}(z)`, `z = ${format(z)} -> output = ${format(output)}`]} />
      </svg>
    </VisualFrame>
  );
}

function PerceptronGeometryScene({
  boundary,
  selected,
  selectedPrediction,
  selectedScore,
  selectedPoint,
  onSelectPoint,
}: {
  boundary: { w1: number; w2: number; b: number };
  selected: { x: number; y: number; label: number };
  selectedPrediction: number;
  selectedScore: number;
  selectedPoint: string;
  onSelectPoint: (id: string) => void;
}) {
  const line = boundaryLine(boundary);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
      <VisualFrame dark>
        <svg viewBox="0 0 720 420" className="h-full w-full" role="img" aria-label="Perceptron decision plane">
          <GridLines dark />
          <DecisionRegions boundary={boundary} />
          <line x1={toPlaneX(line[0].x)} y1={toPlaneY(line[0].y)} x2={toPlaneX(line[1].x)} y2={toPlaneY(line[1].y)} stroke="#fff8e8" strokeWidth="5" />
          <text x="42" y="45" className="fill-[#fff8e8] text-[22px] font-black">
            w1x + w2y + b = 0
          </text>
          {trainingPoints.map((point) => {
            const score = boundary.w1 * point.x + boundary.w2 * point.y + boundary.b;
            const prediction = score >= 0 ? 1 : 0;
            const selected = point.id === selectedPoint;
            return (
              <g key={point.id} className="cursor-pointer" onClick={() => onSelectPoint(point.id)}>
                <circle
                  cx={toPlaneX(point.x)}
                  cy={toPlaneY(point.y)}
                  r={selected ? 16 : 12}
                  fill={point.label ? "#ef6a45" : "#6de0d2"}
                  stroke={prediction === point.label ? "#10100f" : "#fff8e8"}
                  strokeWidth={selected ? 5 : 3}
                />
                <text x={toPlaneX(point.x)} y={toPlaneY(point.y) + 5} textAnchor="middle" className="fill-[#10100f] text-[12px] font-black">
                  {point.id}
                </text>
              </g>
            );
          })}
        </svg>
      </VisualFrame>
      <div className="rounded-lg bg-[#fff8e8] p-4 text-[#211c18]">
        <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#137a72]">selected point</p>
        <h3 className="mt-2 text-2xl font-black">Point {selectedPoint.toUpperCase()}</h3>
        <div className="mt-4 space-y-3 font-mono text-sm">
          <p>x = {format(selected.x)}</p>
          <p>y = {format(selected.y)}</p>
          <p>score = {format(selectedScore)}</p>
          <p>prediction = {selectedPrediction}</p>
          <p>label = {selected.label}</p>
        </div>
        <div className={`mt-5 rounded-md p-3 text-sm font-black ${selectedPrediction === selected.label ? "bg-[#cceee6]" : "bg-[#ffd8c9]"}`}>
          {selectedPrediction === selected.label ? "The point is on the expected side." : "This point is misclassified."}
        </div>
      </div>
    </div>
  );
}

function TinyNetworkScene({ hiddenScale }: { hiddenScale: number }) {
  const boundaries = [
    { w1: 1, w2: 0.65, b: -0.35 * hiddenScale, color: "#6de0d2" },
    { w1: -1, w2: 0.65, b: -0.35 * hiddenScale, color: "#ef6a45" },
    { w1: 0, w2: -1, b: 0.55 * hiddenScale, color: "#f7cf5f" },
  ];

  return (
    <VisualFrame>
      <svg viewBox="0 0 720 420" className="h-full w-full" role="img" aria-label="Tiny network combining boundaries">
        <GridLines />
        <CombinedRegion hiddenScale={hiddenScale} />
        {boundaries.map((boundary, index) => {
          const line = boundaryLine(boundary);
          return (
            <line
              key={index}
              x1={toPlaneX(line[0].x)}
              y1={toPlaneY(line[0].y)}
              x2={toPlaneX(line[1].x)}
              y2={toPlaneY(line[1].y)}
              stroke={boundary.color}
              strokeWidth="4"
              strokeDasharray={index === 2 ? "10 8" : undefined}
            />
          );
        })}
        {xorPoints.map((point) => (
          <circle key={point.id} cx={toPlaneX(point.x)} cy={toPlaneY(point.y)} r="12" fill={point.label ? "#ef6a45" : "#137a72"} stroke="#211c18" strokeWidth="3" />
        ))}
        <g transform="translate(500 72)">
          <NetworkGlyph />
        </g>
        <text x="42" y="45" className="fill-[#211c18] text-[22px] font-black">
          hidden neurons combine simple cuts
        </text>
      </svg>
    </VisualFrame>
  );
}

function BackpropScene({
  input,
  weights,
  bias,
  prediction,
  target,
  loss,
  pulse,
}: {
  input: number[];
  weights: number[];
  bias: number;
  prediction: number;
  target: number;
  loss: number;
  pulse: number;
}) {
  const left = [
    { x: 90, y: 130 },
    { x: 90, y: 270 },
  ];
  const neuron = { x: 350, y: 200 };
  const out = { x: 595, y: 200 };
  const error = target - prediction;

  return (
    <VisualFrame dark>
      <svg viewBox="0 0 720 400" className="h-full w-full" role="img" aria-label="Backpropagation intuition scene">
        <GridLines dark />
        {left.map((node, index) => (
          <g key={index}>
            <SignalEdge from={node} to={neuron} weight={weights[index]} />
            <SignalPulse key={`${pulse}-back-${index}`} from={neuron} to={node} delay={index * 0.1} positive={error >= 0} reverse />
            <Node x={node.x} y={node.y} label={`x${index + 1}`} value={input[index]} active={input[index]} />
            <text x="165" y={node.y + 5} className="fill-[#fff8e8] text-[15px] font-bold">
              w{index + 1} = {format(weights[index])}
            </text>
          </g>
        ))}
        <circle cx={neuron.x} cy={neuron.y} r="55" fill="#25211a" stroke="#f7cf5f" strokeWidth="4" />
        <text x={neuron.x} y={neuron.y - 4} textAnchor="middle" className="fill-[#fff8e8] text-[18px] font-black">
          predict
        </text>
        <text x={neuron.x} y={neuron.y + 22} textAnchor="middle" className="fill-[#f7cf5f] text-[14px] font-black">
          b {format(bias)}
        </text>
        <SignalEdge from={neuron} to={out} weight={prediction} />
        <SignalPulse key={`${pulse}-out-back`} from={out} to={neuron} delay={0.25} positive={error >= 0} reverse />
        <Node x={out.x} y={out.y} label="y" value={prediction} active={prediction} />
        <line x1="600" y1="312" x2="600" y2={312 - target * 100} stroke="#6de0d2" strokeWidth="8" strokeLinecap="round" />
        <line x1="632" y1="312" x2="632" y2={312 - prediction * 100} stroke="#ef6a45" strokeWidth="8" strokeLinecap="round" />
        <text x="560" y="340" className="fill-[#fff8e8] text-[13px] font-black">target</text>
        <text x="615" y="340" className="fill-[#fff8e8] text-[13px] font-black">prediction</text>
        <text x="42" y="48" className="fill-[#fff8e8] text-[22px] font-black">
          loss = {format(loss)}
        </text>
        <text x="42" y="78" className={error >= 0 ? "fill-[#6de0d2] text-[15px] font-bold" : "fill-[#ff8c6b] text-[15px] font-bold"}>
          error signal = {format(error)}
        </text>
      </svg>
    </VisualFrame>
  );
}

function VisualFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`h-[430px] overflow-hidden rounded-lg border ${dark ? "border-white/10 bg-[#10100f]" : "border-[#21180f]/10 bg-[#fffdf4]"}`}>
      {children}
    </div>
  );
}

function Node({ x, y, label, value, active }: { x: number; y: number; label: string; value: number; active: number }) {
  const intensity = clamp(Math.abs(active), 0, 1.5);
  return (
    <g>
      <circle cx={x} cy={y} r={34 + intensity * 8} fill="#6de0d2" opacity={0.08 + intensity * 0.1} />
      <circle cx={x} cy={y} r="31" fill="#fff8e8" stroke="#211c18" strokeWidth="3" />
      <text x={x} y={y - 4} textAnchor="middle" className="fill-[#211c18] text-[15px] font-black">
        {label}
      </text>
      <text x={x} y={y + 16} textAnchor="middle" className="fill-[#137a72] text-[12px] font-black">
        {format(value)}
      </text>
    </g>
  );
}

function SignalEdge({ from, to, weight }: { from: XY; to: XY; weight: number }) {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={weight >= 0 ? "#6de0d2" : "#ff8c6b"}
      strokeWidth={2 + clamp(Math.abs(weight), 0, 2.5) * 3}
      strokeLinecap="round"
      opacity="0.7"
    />
  );
}

function SignalPulse({
  from,
  to,
  delay,
  positive,
  reverse = false,
}: {
  from: XY;
  to: XY;
  delay: number;
  positive: boolean;
  reverse?: boolean;
}) {
  const start = reverse ? to : from;
  const end = reverse ? from : to;
  return (
    <circle r="8" fill={positive ? "#f7cf5f" : "#ff8c6b"} className="signal-pulse" style={{ animationDelay: `${delay}s` }}>
      <animate attributeName="cx" from={start.x} to={end.x} dur="1.15s" begin={`${delay}s`} fill="freeze" />
      <animate attributeName="cy" from={start.y} to={end.y} dur="1.15s" begin={`${delay}s`} fill="freeze" />
      <animate attributeName="opacity" values="0;1;1;0" dur="1.15s" begin={`${delay}s`} fill="freeze" />
    </circle>
  );
}

function FormulaStrip({ lines }: { lines: string[] }) {
  return (
    <g transform="translate(42 332)">
      <rect width="638" height="34" rx="8" fill="#10100f" opacity="0.78" />
      <text x="16" y="22" className="fill-[#fff8e8] text-[13px] font-mono font-bold">
        {lines.join("    |    ")}
      </text>
    </g>
  );
}

function GridLines({ dark = false }: { dark?: boolean }) {
  return (
    <g opacity={dark ? 0.16 : 0.22}>
      {Array.from({ length: 12 }, (_, index) => (
        <line key={`v-${index}`} x1={40 + index * 60} y1="20" x2={40 + index * 60} y2="400" stroke={dark ? "#fff8e8" : "#211c18"} />
      ))}
      {Array.from({ length: 7 }, (_, index) => (
        <line key={`h-${index}`} x1="20" y1={40 + index * 60} x2="700" y2={40 + index * 60} stroke={dark ? "#fff8e8" : "#211c18"} />
      ))}
    </g>
  );
}

function activationPath(kind: ActivationKind) {
  const points = Array.from({ length: 161 }, (_, index) => {
    const z = -4 + index * 0.05;
    const y = activationValue(kind, z);
    return graphPoint(z, y, kind);
  });
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function graphPoint(z: number, output: number, kind: ActivationKind) {
  const x = 120 + ((clamp(z, -4, 4) + 4) / 8) * 500;
  const normalized = kind === "relu" ? clamp(output / 4, 0, 1) : clamp(output, 0, 1);
  const y = 300 - normalized * 220;
  return { x, y };
}

function boundaryLine(boundary: { w1: number; w2: number; b: number }) {
  if (Math.abs(boundary.w2) < 0.04) {
    const x = -boundary.b / (boundary.w1 || 0.01);
    return [
      { x, y: -3 },
      { x, y: 3 },
    ];
  }
  return [
    { x: -3, y: -(boundary.w1 * -3 + boundary.b) / boundary.w2 },
    { x: 3, y: -(boundary.w1 * 3 + boundary.b) / boundary.w2 },
  ];
}

function toPlaneX(x: number) {
  return 360 + x * 82;
}

function toPlaneY(y: number) {
  return 210 - y * 56;
}

function DecisionRegions({ boundary }: { boundary: { w1: number; w2: number; b: number } }) {
  const cells = Array.from({ length: 30 }, (_, row) =>
    Array.from({ length: 42 }, (_, col) => {
      const x = -3.2 + col * 0.16;
      const y = 3.2 - row * 0.22;
      const fire = boundary.w1 * x + boundary.w2 * y + boundary.b >= 0;
      return { x: toPlaneX(x), y: toPlaneY(y), fire };
    }),
  ).flat();

  return (
    <g>
      {cells.map((cell, index) => (
        <rect key={index} x={cell.x - 7} y={cell.y - 7} width="14" height="14" fill={cell.fire ? "#ef6a45" : "#6de0d2"} opacity="0.12" />
      ))}
    </g>
  );
}

function CombinedRegion({ hiddenScale }: { hiddenScale: number }) {
  const cells = Array.from({ length: 30 }, (_, row) =>
    Array.from({ length: 42 }, (_, col) => {
      const x = -3.2 + col * 0.16;
      const y = 3.2 - row * 0.22;
      const h1 = x + 0.65 * y - 0.35 * hiddenScale > 0;
      const h2 = -x + 0.65 * y - 0.35 * hiddenScale > 0;
      const h3 = -y + 0.55 * hiddenScale > 0;
      const active = (h1 && h3) || (h2 && h3);
      return { x: toPlaneX(x), y: toPlaneY(y), active };
    }),
  ).flat();

  return (
    <g>
      {cells.map((cell, index) => (
        <rect key={index} x={cell.x - 7} y={cell.y - 7} width="14" height="14" fill={cell.active ? "#ef6a45" : "#6de0d2"} opacity={cell.active ? "0.18" : "0.07"} />
      ))}
    </g>
  );
}

function MiniNetworkPoster() {
  return (
    <div className="h-[300px] rounded-lg border border-white/10 bg-[#10100f] p-3">
      <svg viewBox="0 0 340 280" className="h-full w-full" aria-label="Animated mini network">
        <GridLines dark />
        <NetworkGlyph />
        <circle cx="65" cy="75" r="8" fill="#f7cf5f" className="signal-pop" />
        <circle cx="180" cy="140" r="8" fill="#f7cf5f" className="signal-pop signal-delay" />
        <circle cx="292" cy="140" r="8" fill="#f7cf5f" className="signal-pop signal-delay-long" />
      </svg>
    </div>
  );
}

function NetworkGlyph() {
  const left = [
    { x: 45, y: 65 },
    { x: 45, y: 140 },
    { x: 45, y: 215 },
  ];
  const hidden = [
    { x: 170, y: 95 },
    { x: 170, y: 185 },
  ];
  const out = { x: 285, y: 140 };
  return (
    <g>
      {left.map((from, index) =>
        hidden.map((to, hIndex) => (
          <line key={`${index}-${hIndex}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={index === hIndex ? "#6de0d2" : "#ff8c6b"} strokeWidth={index === hIndex ? 5 : 2} opacity="0.75" />
        )),
      )}
      {hidden.map((from, index) => (
        <line key={index} x1={from.x} y1={from.y} x2={out.x} y2={out.y} stroke="#f7cf5f" strokeWidth="4" opacity="0.8" />
      ))}
      {[...left, ...hidden, out].map((node, index) => (
        <circle key={index} cx={node.x} cy={node.y} r="19" fill="#fff8e8" stroke="#211c18" strokeWidth="3" />
      ))}
    </g>
  );
}
