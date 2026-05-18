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
    body: [
      "Imagine we want to predict whether a student passes. We have three rough signals: study hours, sleep quality, and practice score.",
      "The primitive approach is to add them all together. That is easy, but crude. One extra hour of study probably should not count the same as a small change in sleep quality. Some features should matter more; some may matter less; some may even push the answer down.",
      "A neuron is a tiny evidence-adding machine. It multiplies each input by a weight, then adds a bias. The result is the raw score z.",
      "Think of a weight as both importance and direction. A large positive weight says this feature strongly supports the prediction. A negative weight says this feature pushes against it. The bias is the model's baseline tendency before seeing the features.",
    ],
    experiment: [
      "Increase the study-hours weight. The study evidence bar should get louder.",
      "Make the sleep-quality weight negative. Notice that good sleep now reduces the score; that would be a strange learned relationship.",
      "Move the bias up. The model becomes more optimistic before any feature evidence arrives.",
    ],
    formula: "z = w1(study hours) + w2(sleep quality) + w3(practice score) + b",
    formulaContext: "This is just the bookkeeping for the evidence bars. Each term is one feature's contribution; b is the starting score.",
  },
  activation: {
    question: "A neuron has a score. How should that become an output?",
    naive: "Naive approach: use the raw score directly. That is awkward if we want a probability-like answer or a clean yes/no decision.",
    failure: "Where this fails: raw scores can be negative, unbounded, and hard to compare across neurons.",
    mechanism: "Activation fix: pass z through a response rule like step, sigmoid, or ReLU.",
    takeaway: "Takeaway: activation is the neuron's behavior curve. It decides what firing means.",
    body: [
      "After the weighted vote, we have a raw score z. But raw scores are awkward. A score of 2.3 does not automatically mean yes, no, or 91%.",
      "The activation function is the neuron's response rule. It takes the score and turns it into behavior.",
      "A step function gives a hard yes/no. A sigmoid gives a smooth probability-like response between 0 and 1. ReLU ignores negative scores and passes positive scores through.",
      "The key point is that the weighted sum asks, 'How much evidence do we have?' The activation asks, 'Given that evidence, how strongly should this neuron respond?'",
    ],
    experiment: [
      "Switch from sigmoid to step. Notice the output stops changing smoothly.",
      "Move the bias. The score slides left or right along the curve.",
      "Increase the study-hours weight. The same input now lands in a different part of the response curve.",
    ],
    formula: "y = activation(z)",
    formulaContext: "Read this as: take the raw score from the previous board, then pass it through a response curve.",
  },
  perceptron: {
    question: "How does one neuron separate two kinds of examples?",
    naive: "Naive approach: choose one feature threshold, like 'study hours > 0.5'.",
    failure: "Where this fails: real decisions often depend on a mixture of features, not a single axis.",
    mechanism: "Perceptron fix: use w1x + w2y + b. The points where this equals zero form a boundary.",
    takeaway: "Takeaway: one perceptron draws one straight boundary. Useful, but limited.",
    body: [
      "Now reduce the neuron to two inputs: study and sleep. The neuron computes a score from a weighted combination of both.",
      "If z is positive, the perceptron fires. If z is negative, it does not fire. The boundary is the place where the neuron is exactly undecided: z = 0.",
      "That equation draws a line. The line is not arbitrary; it is the set of all points where the weighted evidence balances out.",
      "Changing w1 and w2 rotates the line because it changes the direction of the weight vector. Changing bias slides the line because it changes the baseline threshold.",
    ],
    experiment: [
      "Move w1 and w2. Watch the boundary rotate.",
      "Move bias. Watch the boundary slide without changing its direction.",
      "Try to separate all points perfectly. If a pattern needs a curved boundary, one perceptron will struggle.",
    ],
    formula: "z = w1(study) + w2(sleep) + b; boundary when z = 0",
    formulaContext: "The formula is a score for one point. Setting that score to zero draws the undecided line.",
  },
  network: {
    question: "What if the data cannot be separated by one straight line?",
    naive: "Naive approach: keep rotating one boundary and hope it fits.",
    failure: "Where this fails: some patterns need several simple tests combined together.",
    mechanism: "Hidden-layer fix: let several neurons each carve one region, then combine their outputs.",
    takeaway: "Takeaway: hidden neurons are feature builders. Layers compose simple boundaries into richer shapes.",
    body: [
      "A single perceptron gives one line. That is useful when the data is linearly separable, but many patterns are not.",
      "Instead of asking one neuron to solve the whole problem, a hidden layer uses several neurons. Each one asks a simpler question: is this point on my side of this boundary?",
      "The output neuron then combines those answers. The network is no longer looking only at raw study and sleep; it is looking at features created by the hidden neurons.",
      "This is the start of representation learning. Layers build intermediate features that make the final decision easier.",
    ],
    experiment: [
      "Move the hidden boundary spread. Notice how the combined region grows or shrinks.",
      "Compare the colored region to the single perceptron board above.",
      "Read each hidden boundary as one simple test, then read the final colored region as their combination.",
    ],
    formula: "hidden features = activation(simple boundaries); output = combination of hidden features",
    formulaContext: "Each hidden neuron turns a boundary test into a feature. The output neuron combines those new features.",
  },
  descent: {
    question: "How does the model know how to improve a bad prediction?",
    naive: "Naive approach: randomly try new weights until the loss gets smaller.",
    failure: "Where this fails: random search wastes time and gets worse as the model grows.",
    mechanism: "Gradient descent fix: use backpropagation to estimate the slope of loss with respect to each weight, then step downhill.",
    takeaway: "Takeaway: backprop supplies direction; the learning rate supplies step size.",
    body: [
      "Once the model predicts, we compare the prediction to the target. The loss is just a number that says how wrong the model was.",
      "The primitive way to improve would be random search: try a slightly different weight and hope the loss goes down. That does not scale.",
      "Gradient descent uses the slope of the loss curve. If the slope is positive, step left. If the slope is negative, step right. If the slope is steep, the weight matters a lot.",
      "Backpropagation is the efficient way to compute these slopes for every weight in the network. Backprop gives the direction; gradient descent takes the step; learning rate controls the step size.",
    ],
    experiment: [
      "Press 'Take downhill step' repeatedly. The weight should move along the loss curve.",
      "Increase the learning rate. Large steps move faster, but can overshoot.",
      "Change the target. The whole direction of improvement can flip.",
    ],
    formula: "new weight = old weight - learning_rate * slope",
    formulaContext: "This only makes sense after defining loss: loss is the penalty for being wrong, and the slope says which way reduces that penalty.",
  },
} as const;
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
              Start with the puzzle. Then earn the math.
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
  return (
    <section id={id} className="scroll-mt-4 rounded-lg border border-white/10 bg-[#171923] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6ee7d8]">{tag}</p>
          <h2 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        </div>
        <p className="max-w-2xl rounded-md bg-white/10 px-3 py-2 text-sm font-bold text-[#f0e8d4]">{prompt}</p>
      </div>
      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <div className="rounded-lg border border-[#ffd166]/25 bg-[#ffd166]/10 p-4">
          <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#ffd166]">question</p>
          <p className="mt-2 text-lg font-black leading-7">{notes.question}</p>
        </div>
          <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#6ee7d8]">walkthrough</p>
            <div className="mt-3 space-y-3 text-sm leading-6 text-[#d7cfba]">
              {notes.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        </div>
        <div className="grid gap-3 text-sm leading-6 text-[#d7cfba]">
          <p className="rounded-md border border-white/10 bg-white/[0.05] p-3">{notes.naive}</p>
          <p className="rounded-md border border-white/10 bg-white/[0.05] p-3">{notes.failure}</p>
          <div className="rounded-md border border-[#6ee7d8]/20 bg-[#6ee7d8]/10 p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#6ee7d8]">mechanism</p>
            <p className="mt-2 font-bold text-[#eefaf7]">{notes.mechanism}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#10131b]">{visual}</div>
        <div className="space-y-3">
          <div className="grid gap-3">{controls}</div>
          <div className="rounded-lg border border-[#ffd166]/20 bg-[#ffd166]/10 p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#ffd166]">rule of thumb</p>
            <p className="mt-2 text-sm font-bold leading-6 text-[#fff3cf]">{notes.takeaway}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#c9c1ad]">try this</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#d7cfba]">
              {notes.experiment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0f1117] p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#c9c1ad]">formula in context</p>
            <p className="mt-2 text-sm leading-6 text-[#d7cfba]">{notes.formulaContext}</p>
            <p className="mt-3 rounded-md bg-black/30 p-2 font-mono text-xs leading-6 text-[#f0e8d4]">{notes.formula}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#c9c1ad]">diagram note</p>
            <p className="mt-2 text-sm leading-6 text-[#d7cfba]">{explanation}</p>
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
  const sample = { x: 1.2, y: 1.0 };
  const studyContribution = boundary.w1 * sample.x;
  const sleepContribution = boundary.w2 * sample.y;
  const score = studyContribution + sleepContribution + boundary.b;
  const fires = score >= 0;
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Perceptron boundary board">
      <defs>
        <clipPath id="perceptron-plane">
          <rect x="430" y="104" width="310" height="250" rx="12" />
        </clipPath>
      </defs>
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        Score one point, then draw the zero-score line
      </text>
      <text x="42" y="72" className="fill-[#c9c1ad] text-[15px] font-bold">
        A perceptron fires when z is positive. The boundary is where z is exactly zero.
      </text>

      <g transform="translate(48 112)">
        <text x="0" y="0" className="fill-[#ffd166] text-[17px] font-black">Point A</text>
        <text x="0" y="26" className="fill-[#c9c1ad] text-[13px] font-bold">study = {fmt(sample.x)}, sleep = {fmt(sample.y)}</text>
        <ContributionRow y={70} label="study evidence" value={studyContribution} />
        <ContributionRow y={130} label="sleep evidence" value={sleepContribution} />
        <ContributionRow y={190} label="bias baseline" value={boundary.b} />
        <line x1="0" y1="230" x2="310" y2="230" stroke="#fff8e8" strokeOpacity="0.25" strokeWidth="2" />
        <text x="0" y="268" className={fires ? "fill-[#ff7a59] text-[25px] font-black" : "fill-[#6ee7d8] text-[25px] font-black"}>
          z = {fmt(score)}: {fires ? "fires" : "does not fire"}
        </text>
        <text x="0" y="300" className="fill-[#c9c1ad] text-[13px] font-bold">
          This same score rule is applied to every point on the plane.
        </text>
      </g>

      <rect x="430" y="104" width="310" height="250" rx="12" fill="#0c0f15" stroke="#fff8e8" strokeOpacity="0.3" />
      <g clipPath="url(#perceptron-plane)">
        <SimpleDecisionFill boundary={boundary} />
        <SimplePlaneAxis />
        {segment ? (
          <line
            x1={smallMapX(segment[0].x)}
            y1={smallMapY(segment[0].y)}
            x2={smallMapX(segment[1].x)}
            y2={smallMapY(segment[1].y)}
            stroke="#fff8e8"
            strokeWidth="5"
          />
        ) : null}
        <circle cx={smallMapX(sample.x)} cy={smallMapY(sample.y)} r="13" fill="#ffd166" stroke="#0f1117" strokeWidth="3" />
      </g>
      <text x="444" y="386" className="fill-[#6ee7d8] text-[13px] font-black">blue side: z &lt; 0</text>
      <text x="598" y="386" className="fill-[#ff7a59] text-[13px] font-black">coral side: z &gt; 0</text>
      <g transform="translate(430 68)">
        <rect x="0" y="0" width="310" height="26" rx="7" fill="#ffffff" opacity="0.08" />
        <text x="12" y="18" className="fill-[#fff8e8] text-[13px] font-black">
          white line = all points where z = 0
        </text>
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

function ContributionRow({ y, label, value }: { y: number; label: string; value: number }) {
  const positive = value >= 0;
  const width = Math.min(120, Math.abs(value) * 72);
  return (
    <g transform={`translate(0 ${y})`}>
      <text x="0" y="5" className="fill-[#fff8e8] text-[14px] font-black">{label}</text>
      <line x1="150" y1="0" x2="300" y2="0" stroke="#fff8e8" strokeOpacity="0.14" strokeWidth="9" strokeLinecap="round" />
      <line
        x1="225"
        y1="0"
        x2={225 + (positive ? width : -width)}
        y2="0"
        stroke={positive ? "#ff7a59" : "#6ee7d8"}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <text x="318" y="5" className={positive ? "fill-[#ff7a59] text-[14px] font-black" : "fill-[#6ee7d8] text-[14px] font-black"}>
        {positive ? "+" : ""}{fmt(value)}
      </text>
    </g>
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
  const error = prediction - target;
  const gap = Math.abs(error);
  return (
    <svg viewBox="0 0 820 430" className="h-full w-full" role="img" aria-label="Gradient descent board">
      <defs>
        <marker id="step-tip" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#ffd166" />
        </marker>
      </defs>
      <BoardGrid />
      <text x="42" y="46" className="fill-[#fff8e8] text-[24px] font-black">
        First define what better means
      </text>
      <text x="42" y="74" className="fill-[#c9c1ad] text-[15px] font-bold">
        We minimize loss because loss is the penalty for being wrong.
      </text>

      <g transform="translate(48 112)">
        <text x="0" y="0" className="fill-[#ffd166] text-[17px] font-black">1. Compare prediction to target</text>
        <line x1="40" y1="190" x2="40" y2="40" stroke="#fff8e8" strokeOpacity="0.25" strokeWidth="8" strokeLinecap="round" />
        <line x1="105" y1="190" x2="105" y2="40" stroke="#fff8e8" strokeOpacity="0.25" strokeWidth="8" strokeLinecap="round" />
        <line x1="40" y1="190" x2="40" y2={190 - prediction * 150} stroke="#6ee7d8" strokeWidth="18" strokeLinecap="round" />
        <line x1="105" y1="190" x2="105" y2={190 - target * 150} stroke="#ffd166" strokeWidth="18" strokeLinecap="round" />
        <line
          x1="146"
          y1={190 - prediction * 150}
          x2="146"
          y2={190 - target * 150}
          stroke="#ff7a59"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <text x="18" y="222" className="fill-[#6ee7d8] text-[13px] font-black">prediction {fmt(prediction)}</text>
        <text x="88" y="246" className="fill-[#ffd166] text-[13px] font-black">target {target}</text>
        <text x="170" y="120" className="fill-[#ff7a59] text-[15px] font-black">gap = {fmt(gap)}</text>
      </g>

      <g transform="translate(292 112)">
        <text x="0" y="0" className="fill-[#ffd166] text-[17px] font-black">2. Turn the gap into loss</text>
        <rect x="0" y="44" width="180" height="122" rx="14" fill="#ffffff" opacity="0.08" />
        <text x="20" y="84" className="fill-[#c9c1ad] text-[15px] font-bold">loss penalizes error</text>
        <text x="20" y="123" className="fill-[#fff8e8] text-[20px] font-black">loss = 1/2 gap²</text>
        <text x="20" y="154" className="fill-[#ff7a59] text-[24px] font-black">{fmt(loss)}</text>
        <text x="0" y="208" className="fill-[#c9c1ad] text-[13px] font-bold">Smaller loss means a better prediction.</text>
      </g>

      <g transform="translate(505 105)">
        <text x="0" y="7" className="fill-[#ffd166] text-[17px] font-black">3. Step toward lower loss</text>
        <line x1="20" y1="255" x2="275" y2="255" stroke="#fff8e8" strokeWidth="2" />
        <line x1="20" y1="255" x2="20" y2="62" stroke="#fff8e8" strokeWidth="2" />
        <path
          d={path
            .replaceAll("M ", "M ")
            .replaceAll("L ", "L ")
            .replace(/([ML]) ([0-9.]+) ([0-9.]+)/g, (_match, command, x, y) => {
              const shiftedX = Number(x) - 85;
              const shiftedY = Number(y) - 80;
              return `${command} ${shiftedX} ${shiftedY}`;
            })}
          fill="none"
          stroke="#6ee7d8"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={current.x - 85}
          y1={current.y - 80}
          x2={next.x - 85}
          y2={next.y - 80}
          stroke="#ffd166"
          strokeWidth="5"
          markerEnd="url(#step-tip)"
        />
        <circle cx={current.x - 85} cy={current.y - 80} r="11" fill="#ff7a59" stroke="#fff8e8" strokeWidth="3" />
        <text x="30" y="286" className="fill-[#c9c1ad] text-[12px] font-bold">weight</text>
        <text x="-8" y="72" className="fill-[#c9c1ad] text-[12px] font-bold">loss</text>
        <text x="0" y="324" className="fill-[#ff7a59] text-[13px] font-black">slope = {fmt(slope)}</text>
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

function smallMapX(x: number) {
  return 585 + x * 45;
}

function smallMapY(y: number) {
  return 229 - y * 35;
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

function SimpleDecisionFill({ boundary }: { boundary: { w1: number; w2: number; b: number } }) {
  const positive = halfPlane(boundary);
  return (
    <g>
      <rect x="430" y="104" width="310" height="250" fill="#6ee7d8" opacity="0.18" />
      {positive.length > 2 ? (
        <polygon points={positive.map((point) => `${smallMapX(point.x)},${smallMapY(point.y)}`).join(" ")} fill="#ff7a59" opacity="0.25" />
      ) : null}
    </g>
  );
}

function SimplePlaneAxis() {
  return (
    <g opacity="0.6">
      <line x1={smallMapX(-3)} y1={smallMapY(0)} x2={smallMapX(3)} y2={smallMapY(0)} stroke="#fff8e8" />
      <line x1={smallMapX(0)} y1={smallMapY(-3)} x2={smallMapX(0)} y2={smallMapY(3)} stroke="#fff8e8" />
      <text x={smallMapX(1.75)} y={smallMapY(0) - 8} className="fill-[#c9c1ad] text-[12px] font-bold">study</text>
      <text x={smallMapX(0) + 8} y={smallMapY(2.45)} className="fill-[#c9c1ad] text-[12px] font-bold">sleep</text>
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
