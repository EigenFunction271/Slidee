"use client";

import { useMemo, useState } from "react";

type ActivationKind = "step" | "sigmoid" | "relu";
type Point = { x: number; y: number };

const lessons = [
  ["weighted-vote", "01", "Weighted Vote"],
  ["activation", "02", "Activation Curve"],
  ["perceptron", "03", "Decision Boundary"],
  ["network", "04", "Combining Neurons"],
  ["descent", "05", "Gradient Descent"],
] as const;

const featureNames = ["study hours", "sleep quality", "practice score"];
const lessonNotes = {
  "weighted-vote": {
    question: "How should a model decide whether a student is likely to pass?",
    naive: "Naive approach: add every input equally. That treats one extra hour of study, a good night of sleep, and a practice score bump as equally useful.",
    failure: "Where this fails: different signals should matter by different amounts, and some signals can even push the prediction down.",
    mechanism: "Neuron fix: multiply each feature by a learned weight, add a baseline bias, and collect the result into a score z.",
    takeaway: "Takeaway: weights are importance and direction; bias is the starting assumption before evidence arrives.",
  },
  activation: {
    question: "A neuron has a score. How should that become an output?",
    naive: "Naive approach: use the raw score directly. That is awkward if we want a probability-like answer or a clean yes/no decision.",
    failure: "Where this fails: raw scores can be negative, unbounded, and hard to compare across neurons.",
    mechanism: "Activation fix: pass z through a response rule like step, sigmoid, or ReLU.",
    takeaway: "Takeaway: activation is the neuron's behavior curve. It decides what firing means.",
  },
  perceptron: {
    question: "How does one neuron separate two kinds of examples?",
    naive: "Naive approach: choose one feature threshold, like 'study hours > 0.5'.",
    failure: "Where this fails: real decisions often depend on a mixture of features, not a single axis.",
    mechanism: "Perceptron fix: use w1x + w2y + b. The points where this equals zero form a boundary.",
    takeaway: "Takeaway: one perceptron draws one straight boundary. Useful, but limited.",
  },
  network: {
    question: "What if the data cannot be separated by one straight line?",
    naive: "Naive approach: keep rotating one boundary and hope it fits.",
    failure: "Where this fails: some patterns need several simple tests combined together.",
    mechanism: "Hidden-layer fix: let several neurons each carve one region, then combine their outputs.",
    takeaway: "Takeaway: hidden neurons are feature builders. Layers compose simple boundaries into richer shapes.",
  },
  descent: {
    question: "How does the model know how to improve a bad prediction?",
    naive: "Naive approach: randomly try new weights until the loss gets smaller.",
    failure: "Where this fails: random search wastes time and gets worse as the model grows.",
    mechanism: "Gradient descent fix: use backpropagation to estimate the slope of loss with respect to each weight, then step downhill.",
    takeaway: "Takeaway: backprop supplies direction; the learning rate supplies step size.",
  },
} as const;
const pointSet = [
  { x: -2.2, y: 1.5, label: 0 },
  { x: -1.4, y: -1.4, label: 0 },
  { x: -0.4, y: 2.1, label: 0 },
  { x: 0.9, y: 1.3, label: 1 },
  { x: 1.8, y: -0.1, label: 1 },
  { x: 2.25, y: -1.6, label: 1 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function activate(kind: ActivationKind, z: number) {
  if (kind === "step") return z >= 0 ? 1 : 0;
  if (kind === "relu") return Math.max(0, z);
  return sigmoid(z);
}

function fmt(value: number) {
  return value.toFixed(2);
}

export function CourseExperience() {
  const [features, setFeatures] = useState([0.75, 0.45, 0.6]);
  const [weights, setWeights] = useState([1.1, -0.65, 0.85]);
  const [bias, setBias] = useState(0.1);
  const [activation, setActivation] = useState<ActivationKind>("sigmoid");
  const [boundary, setBoundary] = useState({ w1: 1.05, w2: -0.9, b: 0.1 });
  const [spread, setSpread] = useState(1);
  const [descentWeight, setDescentWeight] = useState(0.4);
  const [learningRate, setLearningRate] = useState(0.45);
  const [target, setTarget] = useState(1);

  const contributions = features.map((feature, index) => feature * weights[index]);
  const z = contributions.reduce((sum, value) => sum + value, bias);
  const y = activate(activation, z);

  const descentInput = 0.85;
  const fixedSleepContribution = 0.35 * -0.65;
  const prediction = sigmoid(descentInput * descentWeight + fixedSleepContribution + bias);
  const loss = 0.5 * (target - prediction) ** 2;
  const slope = (prediction - target) * prediction * (1 - prediction) * descentInput;
  const nextWeight = descentWeight - learningRate * slope;

  function updateList(setter: (value: number[]) => void, current: number[], index: number, value: number) {
    setter(current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  return (
    <main className="min-h-screen bg-[#0f1117] text-[#fff8e8]">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="top-4 h-fit rounded-lg border border-white/10 bg-[#171923] p-4 lg:sticky">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6ee7d8]">course prototype</p>
          <h1 className="mt-2 text-2xl font-black">Neural Networks, Visually</h1>
          <p className="mt-3 text-sm leading-6 text-[#c9c1ad]">
            Problem first, mechanism second. Each board starts with the thing we are trying to
            explain, then shows why the neural-network idea exists.
          </p>
          <nav className="mt-5 space-y-2" aria-label="Lessons">
            {lessons.map(([id, tag, title]) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-sm font-black transition hover:border-[#ffd166]/70 hover:bg-white/[0.08]"
              >
                <span className="font-mono text-[#ffd166]">{tag}</span>
                <span>{title}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-[#171923] p-5 sm:p-7">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6ee7d8]">visual intuition first</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
              Make every symbol point to something you can see.
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#c9c1ad]">
              The course now follows the same pattern as the articles: concrete puzzle, primitive
              approach, failure mode, better mechanism, and rule of thumb. The math stays attached
              to the visual object it describes.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {["Puzzle", "Primitive", "Failure", "Mechanism", "Takeaway"].map((step, index) => (
                <div key={step} className="rounded-md border border-white/10 bg-white/[0.05] p-3">
                  <p className="font-mono text-xs font-black text-[#ffd166]">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-1 text-sm font-black">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <Board
            id="weighted-vote"
            tag="01"
            title="A neuron adds weighted evidence"
            prompt="Each feature casts a vote. A weight decides how loud that vote is."
            notes={lessonNotes["weighted-vote"]}
            visual={<WeightedVoteBoard features={features} weights={weights} contributions={contributions} bias={bias} z={z} />}
            controls={
              <>
                {features.map((value, index) => (
                  <Range
                    key={featureNames[index]}
                    label={featureNames[index]}
                    value={value}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={(next) => updateList(setFeatures, features, index, next)}
                  />
                ))}
                {weights.map((value, index) => (
                  <Range
                    key={`w-${index}`}
                    label={`weight for ${featureNames[index]}`}
                    value={value}
                    min={-2}
                    max={2}
                    step={0.05}
                    onChange={(next) => updateList(setWeights, weights, index, next)}
                  />
                ))}
                <Range label="bias: baseline before evidence" value={bias} min={-1.5} max={1.5} step={0.05} onChange={setBias} />
              </>
            }
            explanation="Bias is the starting score before the features vote. The weighted evidence bars show exactly what gets added into z."
          />

          <Board
            id="activation"
            tag="02"
            title="Activation turns score into response"
            prompt="The score z lands on a curve. The curve returns the neuron output y."
            notes={lessonNotes.activation}
            visual={<ActivationBoard z={z} y={y} kind={activation} />}
            controls={
              <>
                <Segmented
                  label="activation"
                  value={activation}
                  options={[
                    ["step", "Step"],
                    ["sigmoid", "Sigmoid"],
                    ["relu", "ReLU"],
                  ]}
                  onChange={setActivation}
                />
                <Range label="bias: move score left/right" value={bias} min={-1.5} max={1.5} step={0.05} onChange={setBias} />
                <Range
                  label={`weight for ${featureNames[0]}`}
                  value={weights[0]}
                  min={-2}
                  max={2}
                  step={0.05}
                  onChange={(next) => updateList(setWeights, weights, 0, next)}
                />
              </>
            }
            explanation="The vertical guide reads the raw score. The horizontal guide reads the output. This is why the graph matters."
          />

          <Board
            id="perceptron"
            tag="03"
            title="A perceptron makes a boundary"
            prompt="The boundary is the place where the weighted score is exactly zero."
            notes={lessonNotes.perceptron}
            visual={<PerceptronBoard boundary={boundary} />}
            controls={
              <>
                <Range label="w1: study direction" value={boundary.w1} min={-2} max={2} step={0.05} onChange={(w1) => setBoundary((state) => ({ ...state, w1 }))} />
                <Range label="w2: sleep direction" value={boundary.w2} min={-2} max={2} step={0.05} onChange={(w2) => setBoundary((state) => ({ ...state, w2 }))} />
                <Range label="bias: slide boundary" value={boundary.b} min={-2} max={2} step={0.05} onChange={(b) => setBoundary((state) => ({ ...state, b }))} />
              </>
            }
            explanation="The arrows show the weight vector. The line is perpendicular to it. Bias slides the line without changing the weight direction."
          />

          <Board
            id="network"
            tag="04"
            title="Hidden neurons combine simple regions"
            prompt="A layer is a small committee of boundaries."
            notes={lessonNotes.network}
            visual={<NetworkBoard spread={spread} />}
            controls={<Range label="hidden boundary spread" value={spread} min={0.55} max={1.75} step={0.05} onChange={setSpread} />}
            explanation="Each hidden neuron still has one simple boundary. The output combines their regions into a shape one line cannot make."
          />

          <Board
            id="descent"
            tag="05"
            title="Backprop gives gradient descent a slope"
            prompt="Backprop answers: which way is downhill for this weight?"
            notes={lessonNotes.descent}
            visual={
              <GradientDescentBoard
                weight={descentWeight}
                nextWeight={nextWeight}
                input={descentInput}
                bias={bias}
                target={target}
                prediction={prediction}
                loss={loss}
                slope={slope}
              />
            }
            controls={
              <>
                <Range label="current weight w1" value={descentWeight} min={-2} max={2} step={0.05} onChange={setDescentWeight} />
                <Range label="learning rate" value={learningRate} min={0.05} max={1} step={0.05} onChange={setLearningRate} />
                <Segmented
                  label="target"
                  value={String(target)}
                  options={[
                    ["0", "Target 0"],
                    ["1", "Target 1"],
                  ]}
                  onChange={(value) => setTarget(Number(value))}
                />
                <button
                  className="rounded-md bg-[#ffd166] px-4 py-3 text-sm font-black text-[#1b160c] transition hover:bg-[#ffe29b]"
                  onClick={() => setDescentWeight(nextWeight)}
                >
                  Take downhill step
                </button>
              </>
            }
            explanation="The curve shows loss if only w1 changes. The yellow arrow is the next gradient descent step."
          />
        </div>
      </div>
    </main>
  );
}

function Board({
  id,
  tag,
  title,
  prompt,
  notes,
  visual,
  controls,
  explanation,
}: {
  id: string;
  tag: string;
  title: string;
  prompt: string;
  notes: (typeof lessonNotes)[keyof typeof lessonNotes];
  visual: React.ReactNode;
  controls: React.ReactNode;
  explanation: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section id={id} className="scroll-mt-4 rounded-lg border border-white/10 bg-[#171923] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6ee7d8]">{tag}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
        <p className="max-w-2xl rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-[#f0e8d4]">{prompt}</p>
      </div>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-[#ffd166]/25 bg-[#ffd166]/10 p-4">
          <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#ffd166]">question</p>
          <p className="mt-2 text-lg font-black leading-7">{notes.question}</p>
        </div>
        <div className="grid gap-2 text-sm leading-6 text-[#d7cfba]">
          <p className="rounded-md bg-white/[0.05] p-3">{notes.naive}</p>
          <p className="rounded-md bg-white/[0.05] p-3">{notes.failure}</p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#10131b]">{visual}</div>
        <div className="space-y-3">
          <div className="grid gap-3">{controls}</div>
          <div className="rounded-lg border border-[#6ee7d8]/20 bg-[#6ee7d8]/10 p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#6ee7d8]">mechanism</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#eefaf7]">{notes.mechanism}</p>
          </div>
          <div className="rounded-lg border border-[#ffd166]/20 bg-[#ffd166]/10 p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#ffd166]">rule of thumb</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#fff3cf]">{notes.takeaway}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <button className="flex w-full justify-between text-left font-black" onClick={() => setOpen((value) => !value)}>
              <span>{open ? "Hide explanation" : "Show explanation"}</span>
              <span>{open ? "-" : "+"}</span>
            </button>
            {open ? <p className="mt-3 text-sm leading-6 text-[#d7cfba]">{explanation}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function WeightedVoteBoard({
  features,
  weights,
  contributions,
  bias,
  z,
}: {
  features: number[];
  weights: number[];
  contributions: number[];
  bias: number;
  z: number;
}) {
  const totalBar = clamp((z + 3) / 6, 0, 1);
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Weighted evidence board">
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        Toy task: predict pass probability
      </text>
      <text x="42" y="74" className="fill-[#c9c1ad] text-[15px] font-bold">
        Primitive version: equal votes. Better version: learned weights.
      </text>
      <g transform="translate(600 100)">
        <rect x="0" y="0" width="165" height="78" rx="10" fill="#ffffff" opacity="0.07" />
        <text x="14" y="26" className="fill-[#ffd166] text-[13px] font-black">Why weights?</text>
        <text x="14" y="50" className="fill-[#c9c1ad] text-[12px] font-bold">Study and sleep should</text>
        <text x="14" y="67" className="fill-[#c9c1ad] text-[12px] font-bold">not count the same.</text>
      </g>
      <g transform="translate(52 118)">
        {features.map((feature, index) => {
          const contribution = contributions[index];
          const width = Math.abs(contribution) * 90;
          const positive = contribution >= 0;
          return (
            <g key={featureNames[index]} transform={`translate(0 ${index * 82})`}>
              <text x="0" y="0" className="fill-[#fff8e8] text-[17px] font-black">
                {featureNames[index]}
              </text>
              <text x="0" y="24" className="fill-[#c9c1ad] text-[13px] font-bold">
                value {fmt(feature)} x weight {fmt(weights[index])}
              </text>
              <line x1="250" y1="10" x2="520" y2="10" stroke="#fff8e8" strokeOpacity="0.18" strokeWidth="8" strokeLinecap="round" />
              <line
                x1="385"
                y1="10"
                x2={385 + (positive ? width : -width)}
                y2="10"
                stroke={positive ? "#6ee7d8" : "#ff7a59"}
                strokeWidth="18"
                strokeLinecap="round"
              />
              <text x="560" y="17" className={positive ? "fill-[#6ee7d8] text-[17px] font-black" : "fill-[#ff7a59] text-[17px] font-black"}>
                {positive ? "+" : ""}
                {fmt(contribution)}
              </text>
            </g>
          );
        })}
      </g>
      <g transform="translate(48 360)">
        <text x="0" y="0" className="fill-[#ffd166] text-[17px] font-black">
          bias baseline: {fmt(bias)}
        </text>
        <rect x="210" y="-18" width="430" height="28" rx="14" fill="#ffffff" opacity="0.12" />
        <rect x="210" y="-18" width={430 * totalBar} height="28" rx="14" fill="#ffd166" />
        <text x="670" y="3" className="fill-[#fff8e8] text-[22px] font-black">
          z = {fmt(z)}
        </text>
      </g>
    </svg>
  );
}

function ActivationBoard({ z, y, kind }: { z: number; y: number; kind: ActivationKind }) {
  const path = useMemo(() => activationPath(kind), [kind]);
  const point = activationPoint(z, y, kind);
  const normalized = kind === "relu" ? clamp(y / 4, 0, 1) : clamp(y, 0, 1);
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Activation curve board">
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        y = {kind}(z)
      </text>
      <text x="42" y="74" className="fill-[#c9c1ad] text-[15px] font-bold">
        Raw scores are messy. The activation curve turns them into behavior.
      </text>
      <line x1="100" y1="340" x2="590" y2="340" stroke="#fff8e8" strokeWidth="2" />
      <line x1="145" y1="340" x2="145" y2="92" stroke="#fff8e8" strokeWidth="2" />
      <text x="585" y="370" textAnchor="end" className="fill-[#c9c1ad] text-[13px] font-bold">
        raw score z
      </text>
      <text x="118" y="106" textAnchor="middle" className="fill-[#c9c1ad] text-[13px] font-bold">
        output y
      </text>
      <path d={path} fill="none" stroke="#6ee7d8" strokeWidth="6" strokeLinecap="round" />
      <line x1={point.x} y1="340" x2={point.x} y2={point.y} stroke="#ff7a59" strokeWidth="3" strokeDasharray="8 7" />
      <line x1="145" y1={point.y} x2={point.x} y2={point.y} stroke="#ff7a59" strokeWidth="3" strokeDasharray="8 7" />
      <circle cx={point.x} cy={point.y} r="13" fill="#ffd166" />
      <circle cx={point.x} cy={point.y} r="7" fill="#ff7a59" />
      <text x={clamp(point.x, 210, 545)} y={point.y - 22} textAnchor="middle" className="fill-[#fff8e8] text-[14px] font-black">
        z = {fmt(z)}
      </text>
      <g transform="translate(650 112)">
        <text x="0" y="0" className="fill-[#fff8e8] text-[18px] font-black">
          neuron fires
        </text>
        <rect x="16" y="30" width="38" height="220" rx="19" fill="#ffffff" opacity="0.14" />
        <rect x="16" y={250 - normalized * 220} width="38" height={normalized * 220} rx="19" fill="#ffd166" />
        <text x="0" y="286" className="fill-[#ffd166] text-[24px] font-black">
          y = {fmt(y)}
        </text>
      </g>
      <text x="650" y="92" className="fill-[#ffd166] text-[13px] font-black">
        response rule
      </text>
    </svg>
  );
}

function PerceptronBoard({ boundary }: { boundary: { w1: number; w2: number; b: number } }) {
  const segment = boundarySegment(boundary);
  const normal = normalize({ x: boundary.w1, y: boundary.w2 }, 1.1);
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Perceptron boundary board">
      <defs>
        <clipPath id="perceptron-plane">
          <rect x="115" y="82" width="470" height="280" rx="12" />
        </clipPath>
        <marker id="arrow-tip" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#ffd166" />
        </marker>
      </defs>
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        z = w1(study) + w2(sleep) + b
      </text>
      <text x="42" y="72" className="fill-[#c9c1ad] text-[15px] font-bold">
        Every point on the white line has z = 0: exactly undecided.
      </text>
      <rect x="115" y="82" width="470" height="280" rx="12" fill="#0c0f15" stroke="#fff8e8" strokeOpacity="0.3" />
      <g clipPath="url(#perceptron-plane)">
        <DecisionFill boundary={boundary} />
        <PlaneAxis />
        {segment ? (
          <line x1={mapX(segment[0].x)} y1={mapY(segment[0].y)} x2={mapX(segment[1].x)} y2={mapY(segment[1].y)} stroke="#fff8e8" strokeWidth="5" />
        ) : null}
      </g>
      <line x1={mapX(0)} y1={mapY(0)} x2={mapX(normal.x)} y2={mapY(normal.y)} stroke="#ffd166" strokeWidth="4" markerEnd="url(#arrow-tip)" />
      <text x={mapX(normal.x) + 12} y={mapY(normal.y) - 8} className="fill-[#ffd166] text-[13px] font-black">
        weight direction
      </text>
      {pointSet.map((point) => {
        const predicted = boundary.w1 * point.x + boundary.w2 * point.y + boundary.b >= 0 ? 1 : 0;
        return (
          <circle
            key={`${point.x}-${point.y}`}
            cx={mapX(point.x)}
            cy={mapY(point.y)}
            r="12"
            fill={point.label ? "#ff7a59" : "#6ee7d8"}
            stroke={predicted === point.label ? "#0f1117" : "#fff8e8"}
            strokeWidth={predicted === point.label ? 3 : 6}
          />
        );
      })}
      <g transform="translate(625 118)">
        <text x="0" y="0" className="fill-[#fff8e8] text-[17px] font-black">Read the picture</text>
        <text x="0" y="34" className="fill-[#c9c1ad] text-[14px] font-bold">w1, w2 rotate.</text>
        <text x="0" y="62" className="fill-[#c9c1ad] text-[14px] font-bold">bias slides.</text>
        <text x="0" y="108" className="fill-[#6ee7d8] text-[14px] font-black">blue: z &lt; 0</text>
        <text x="0" y="136" className="fill-[#ff7a59] text-[14px] font-black">coral: z &gt; 0</text>
      </g>
    </svg>
  );
}

function NetworkBoard({ spread }: { spread: number }) {
  const left = { w1: 1, w2: 0.6, b: -0.38 * spread };
  const right = { w1: -1, w2: 0.6, b: -0.38 * spread };
  const cap = { w1: 0, w2: -1, b: 0.55 * spread };
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Hidden neuron board">
      <defs>
        <clipPath id="network-plane">
          <rect x="95" y="82" width="430" height="280" rx="12" />
        </clipPath>
      </defs>
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        Three simple boundaries make one richer region
      </text>
      <text x="42" y="74" className="fill-[#c9c1ad] text-[15px] font-bold">
        When one line fails, use several simple tests and combine their votes.
      </text>
      <rect x="95" y="82" width="430" height="280" rx="12" fill="#0c0f15" stroke="#fff8e8" strokeOpacity="0.3" />
      <g clipPath="url(#network-plane)">
        <CombinedFill spread={spread} />
        <PlaneAxis offsetX={305} />
        {[left, right, cap].map((boundary, index) => {
          const segment = boundarySegment(boundary);
          return segment ? (
            <line
              key={index}
              x1={mapX(segment[0].x, 305)}
              y1={mapY(segment[0].y)}
              x2={mapX(segment[1].x, 305)}
              y2={mapY(segment[1].y)}
              stroke={["#6ee7d8", "#ff7a59", "#ffd166"][index]}
              strokeWidth="4"
            />
          ) : null;
        })}
      </g>
      <g transform="translate(590 100)">
        <MiniNetwork />
        <text x="-16" y="245" className="fill-[#c9c1ad] text-[14px] font-bold">
          Hidden neurons each vote on a region.
        </text>
      </g>
    </svg>
  );
}

function GradientDescentBoard({
  weight,
  nextWeight,
  input,
  bias,
  target,
  prediction,
  loss,
  slope,
}: {
  weight: number;
  nextWeight: number;
  input: number;
  bias: number;
  target: number;
  prediction: number;
  loss: number;
  slope: number;
}) {
  const lossAt = (w: number) => {
    const pred = sigmoid(input * w - 0.23 + bias);
    return 0.5 * (target - pred) ** 2;
  };
  const xFor = (w: number) => 105 + ((clamp(w, -2, 2) + 2) / 4) * 500;
  const yFor = (l: number) => 335 - clamp(l / 0.55, 0, 1) * 235;
  const path = Array.from({ length: 140 }, (_, index) => {
    const w = -2 + (index / 139) * 4;
    return `${index === 0 ? "M" : "L"} ${xFor(w)} ${yFor(lossAt(w))}`;
  }).join(" ");
  const current = { x: xFor(weight), y: yFor(loss) };
  const next = { x: xFor(nextWeight), y: yFor(lossAt(nextWeight)) };
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Gradient descent board">
      <defs>
        <marker id="step-tip" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#ffd166" />
        </marker>
      </defs>
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        Loss landscape for one weight
      </text>
      <text x="42" y="74" className="fill-[#c9c1ad] text-[15px] font-bold">
        Random search is wasteful. Backprop gives the slope; gradient descent uses it.
      </text>
      <line x1="105" y1="335" x2="610" y2="335" stroke="#fff8e8" strokeWidth="2" />
      <line x1="105" y1="335" x2="105" y2="98" stroke="#fff8e8" strokeWidth="2" />
      <path d={path} fill="none" stroke="#6ee7d8" strokeWidth="6" strokeLinecap="round" />
      <line x1={current.x} y1={current.y} x2={next.x} y2={next.y} stroke="#ffd166" strokeWidth="5" markerEnd="url(#step-tip)" />
      <circle cx={current.x} cy={current.y} r="14" fill="#ff7a59" stroke="#fff8e8" strokeWidth="3" />
      <circle cx={next.x} cy={next.y} r="8" fill="#ffd166" />
      <text x={current.x} y={current.y - 22} textAnchor="middle" className="fill-[#fff8e8] text-[14px] font-black">
        w = {fmt(weight)}
      </text>
      <text x="610" y="362" textAnchor="end" className="fill-[#c9c1ad] text-[13px] font-bold">
        weight
      </text>
      <text x="64" y="112" className="fill-[#c9c1ad] text-[13px] font-bold">
        loss
      </text>
      <g transform="translate(650 112)">
        <text x="0" y="0" className="fill-[#fff8e8] text-[16px] font-black">readout</text>
        <text x="0" y="38" className="fill-[#c9c1ad] text-[14px] font-bold">prediction</text>
        <text x="0" y="63" className="fill-[#6ee7d8] text-[22px] font-black">{fmt(prediction)}</text>
        <text x="0" y="102" className="fill-[#c9c1ad] text-[14px] font-bold">target</text>
        <text x="0" y="127" className="fill-[#ffd166] text-[22px] font-black">{target}</text>
        <text x="0" y="166" className="fill-[#c9c1ad] text-[14px] font-bold">slope</text>
        <text x="0" y="191" className="fill-[#ff7a59] text-[22px] font-black">{fmt(slope)}</text>
      </g>
    </svg>
  );
}

function Range({
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
    <label className="rounded-md border border-white/10 bg-white/[0.06] p-3">
      <span className="flex justify-between gap-3 text-sm font-black">
        <span>{label}</span>
        <span className="font-mono text-[#ffd166]">{fmt(value)}</span>
      </span>
      <input
        className="mt-3 w-full accent-[#ff7a59]"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label={label}
      />
    </label>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
      <p className="mb-2 text-sm font-black">{label}</p>
      <div className="grid grid-cols-3 gap-1">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            className={`rounded px-2 py-2 text-sm font-black transition ${
              value === optionValue ? "bg-[#ffd166] text-[#1b160c]" : "bg-white/10 hover:bg-white/15"
            }`}
            onClick={() => onChange(optionValue)}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function BoardGrid() {
  return (
    <g opacity="0.13">
      {Array.from({ length: 11 }, (_, index) => (
        <line key={`v-${index}`} x1={45 + index * 75} y1="20" x2={45 + index * 75} y2="410" stroke="#fff8e8" />
      ))}
      {Array.from({ length: 6 }, (_, index) => (
        <line key={`h-${index}`} x1="20" y1={50 + index * 70} x2="800" y2={50 + index * 70} stroke="#fff8e8" />
      ))}
    </g>
  );
}

function activationPath(kind: ActivationKind) {
  return Array.from({ length: 170 }, (_, index) => {
    const z = -4 + (index / 169) * 8;
    const point = activationPoint(z, activate(kind, z), kind);
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");
}

function activationPoint(z: number, y: number, kind: ActivationKind) {
  const x = 145 + ((clamp(z, -4, 4) + 4) / 8) * 445;
  const normalized = kind === "relu" ? clamp(y / 4, 0, 1) : clamp(y, 0, 1);
  return { x, y: 340 - normalized * 235 };
}

function mapX(x: number, center = 350) {
  return center + x * 68;
}

function mapY(y: number) {
  return 222 - y * 43;
}

function boundarySegment(boundary: { w1: number; w2: number; b: number }) {
  const candidates: Point[] = [];
  if (Math.abs(boundary.w2) > 0.0001) {
    [-3, 3].forEach((x) => {
      const y = -(boundary.w1 * x + boundary.b) / boundary.w2;
      if (y >= -3 && y <= 3) candidates.push({ x, y });
    });
  }
  if (Math.abs(boundary.w1) > 0.0001) {
    [-3, 3].forEach((y) => {
      const x = -(boundary.w2 * y + boundary.b) / boundary.w1;
      if (x >= -3 && x <= 3) candidates.push({ x, y });
    });
  }
  const unique = candidates.filter(
    (point, index, all) =>
      all.findIndex((other) => Math.abs(other.x - point.x) < 0.001 && Math.abs(other.y - point.y) < 0.001) === index,
  );
  return unique.length >= 2 ? [unique[0], unique[1]] : null;
}

function normalize(vector: Point, length: number) {
  const magnitude = Math.hypot(vector.x, vector.y) || 1;
  return { x: (vector.x / magnitude) * length, y: (vector.y / magnitude) * length };
}

function DecisionFill({ boundary }: { boundary: { w1: number; w2: number; b: number } }) {
  const positive = halfPlane(boundary);
  return (
    <g>
      <rect x="115" y="82" width="470" height="280" fill="#6ee7d8" opacity="0.18" />
      {positive.length > 2 ? (
        <polygon points={positive.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(" ")} fill="#ff7a59" opacity="0.25" />
      ) : null}
    </g>
  );
}

function PlaneAxis({ offsetX = 350 }: { offsetX?: number }) {
  return (
    <g opacity="0.6">
      <line x1={mapX(-3, offsetX)} y1={mapY(0)} x2={mapX(3, offsetX)} y2={mapY(0)} stroke="#fff8e8" />
      <line x1={mapX(0, offsetX)} y1={mapY(-3)} x2={mapX(0, offsetX)} y2={mapY(3)} stroke="#fff8e8" />
      <text x={mapX(2.1, offsetX)} y={mapY(0) - 8} className="fill-[#c9c1ad] text-[12px] font-bold">study</text>
      <text x={mapX(0, offsetX) + 8} y={mapY(2.55)} className="fill-[#c9c1ad] text-[12px] font-bold">sleep</text>
    </g>
  );
}

function halfPlane(boundary: { w1: number; w2: number; b: number }) {
  const square = [
    { x: -3, y: -3 },
    { x: 3, y: -3 },
    { x: 3, y: 3 },
    { x: -3, y: 3 },
  ];
  const inside = (point: Point) => boundary.w1 * point.x + boundary.w2 * point.y + boundary.b >= 0;
  const intersect = (a: Point, b: Point) => {
    const da = boundary.w1 * a.x + boundary.w2 * a.y + boundary.b;
    const db = boundary.w1 * b.x + boundary.w2 * b.y + boundary.b;
    const t = da / (da - db || 0.0001);
    return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  };
  const out: Point[] = [];
  square.forEach((current, index) => {
    const previous = square[(index + square.length - 1) % square.length];
    const currentInside = inside(current);
    const previousInside = inside(previous);
    if (currentInside && !previousInside) out.push(intersect(previous, current));
    if (currentInside) out.push(current);
    if (!currentInside && previousInside) out.push(intersect(previous, current));
  });
  return out;
}

function CombinedFill({ spread }: { spread: number }) {
  const cells = Array.from({ length: 28 }, (_, row) =>
    Array.from({ length: 38 }, (_, col) => {
      const x = -3 + col * 0.16;
      const y = 3 - row * 0.22;
      const h1 = x + 0.6 * y - 0.38 * spread > 0;
      const h2 = -x + 0.6 * y - 0.38 * spread > 0;
      const h3 = -y + 0.55 * spread > 0;
      return { x, y, active: (h1 || h2) && h3 };
    }),
  ).flat();
  return (
    <g>
      {cells.map((cell, index) => (
        <rect
          key={index}
          x={mapX(cell.x, 305) - 6}
          y={mapY(cell.y) - 6}
          width="12"
          height="12"
          fill={cell.active ? "#ff7a59" : "#6ee7d8"}
          opacity={cell.active ? 0.24 : 0.08}
        />
      ))}
    </g>
  );
}

function MiniNetwork() {
  const inputs = [
    { x: 0, y: 40 },
    { x: 0, y: 110 },
    { x: 0, y: 180 },
  ];
  const hidden = [
    { x: 110, y: 70 },
    { x: 110, y: 150 },
  ];
  const out = { x: 210, y: 110 };
  return (
    <svg viewBox="-35 10 280 215" width="260" height="220">
      {inputs.map((a, index) =>
        hidden.map((b, hIndex) => (
          <line key={`${index}-${hIndex}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={index === hIndex ? "#6ee7d8" : "#ff7a59"} strokeWidth={index === hIndex ? 5 : 2} opacity="0.8" />
        )),
      )}
      {hidden.map((a, index) => (
        <line key={index} x1={a.x} y1={a.y} x2={out.x} y2={out.y} stroke="#ffd166" strokeWidth="4" />
      ))}
      {[...inputs, ...hidden, out].map((node, index) => (
        <circle key={index} cx={node.x} cy={node.y} r="18" fill="#fff8e8" stroke="#10131b" strokeWidth="3" />
      ))}
    </svg>
  );
}
