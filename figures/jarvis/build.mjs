import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const file = theme === "light" ? "jarvis-light.html" : "jarvis.html";

const WIDTH = 760;
const HEIGHT = 440;

// ---- the model: five stages a request passes through, and three tools the brain can pick ----
const STAGES = [
  { name: "listening", x: -140 },
  { name: "transcribing", x: -74 },
  { name: "thinking", x: 10 },
  { name: "calling tool", x: 50 },
  { name: "speaking", x: 135 },
];
const TOOLS = [
  { name: "calendar", angle: -45 },
  { name: "lights", angle: 0 },
  { name: "web search", angle: 45 },
];
const BRAIN = [10, 0];
const BRAIN_R = 26;
const BRAIN_H = 10;
const DIAL_R = 19;
const DIAL_H = 6;
const DIAL_TOP = BRAIN_H + DIAL_H;
const TOOL_RING = 40;
const BTN_R = 6;
const BTN_Z = 1.2;
const BTN_H = 7;
const PRESS = 3.4;
const toolAt = (tool) => {
  const a = (tool.angle * Math.PI) / 180;
  return [BRAIN[0] + Math.cos(a) * TOOL_RING, BRAIN[1] + Math.sin(a) * TOOL_RING];
};
STAGES[3].x = toolAt(TOOLS[1])[0];

const PLATE = { x: -172, y: -60, w: 344, d: 130, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

const MIC = [-140, 0];
const MIC_TOP = 60.4;
const BOX = { x: -94, y: -16, w: 40, d: 32, r: 3 };
const BOX_H = 14;
const SPEAKER = { x: 112, y: -26, w: 46, d: 52, r: 5 };
const SPEAKER_H = 34;
const SPEAKER_C = [135, 0];
const CONE_Z = SPEAKER_H + 1.6;

const RAIL_Y = [37, 48];
const RAIL_FROM = -156;
const RAIL_TO = 156;
const PUCK = { w: 24, d: 22, r: 3.5 };
const PUCK_Y = 36;
const PUCK_Z = 3;
const PUCK_TOP = 9;
const POST_Y = PUCK_Y + PUCK.d / 2;
const FLAG_Z = 22;
const FLAG_FROM = 30;
const REACH = [STAGES[0].x, STAGES[4].x];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [MIC[0], MIC[1], MIC_TOP + 4], [SPEAKER_C[0], SPEAKER_C[1], SPEAKER_H + 6], [BRAIN[0], BRAIN[1], DIAL_TOP + 2]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 42 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

// ---- bench: plate, feet, screws, ruler strip, label plate ----
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 24))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: -150, y: PLATE.y + PLATE.d - 15, w: 300, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D(STAGES.map((stage) => at([stage.x, strip.y + 3.5, 0.6])), { size: 0.7, tone: "hi" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  const label = { x: -158, y: -52, w: 46, d: 14, r: 1.5 };
  out.push(S(k.slabOf(label, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.lineOnTop([label.x + 3, label.y + 10.5], [label.x + label.w - 3, label.y + 10.5], 0.6, P), { tone: "faint", free: true }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 7], 0.6, P, "x"), "JARVIS", { size: 4.2, tone: "mid" }));
  out.push(D([at([label.x + 2, label.y + 2, 0.6]), at([label.x + label.w - 2, label.y + 2, 0.6])], { size: 0.4 }));
  return out.join("");
}

function rails() {
  const out = [];
  for (const y of RAIL_Y) {
    out.push(S(k.slabOf({ x: RAIL_FROM, y, w: RAIL_TO - RAIL_FROM, d: 5, r: 1 }, 0, 3, P, 3, 0.4), { tone: "mid" }));
    out.push(D([RAIL_FROM + 8, RAIL_TO - 8].map((x) => at([x, y + 2.5, 3])), { size: 0.4 }));
  }
  for (const x of [RAIL_FROM - 5, RAIL_TO]) {
    out.push(S(k.slabOf({ x, y: 34, w: 5, d: 22, r: 1.2 }, 0, 7, P, 3, 0.5), { tone: "mid" }));
    out.push(D([at([x + 2.5, 38, 7]), at([x + 2.5, 52, 7])], { size: 0.45 }));
  }
  return out.join("");
}

// ---- 1 listening: a microphone on a weighted stand ----
function mic() {
  const out = [];
  const [x, y] = MIC;
  out.push(S(k.cylinder(x, y, 13, 0, 3.2, P, 40, 0.6), { tone: "lo" }));
  out.push(L(k.ring(x, y, 10.4, 3.2, P, 40), { tone: "faint" }));
  out.push(D([0, 1, 2].map((i) => at([x + Math.cos((i * 2 * Math.PI) / 3 + 0.6) * 11.6, y + Math.sin((i * 2 * Math.PI) / 3 + 0.6) * 11.6, 3.2])), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 2.4, 3.2, 36.8, P, 24), { tone: "mid", crease: "none" }));
  out.push(L(k.sideArc(x, y, 2.4, 14, P, 12), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 3.8, 20, 3.4, P, 24), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 3.8, 20, 23.4, 24, P), { tone: "lo" }));
  out.push(S(k.cylinder(x, y, 3.4, 38, 3, P, 24), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 8.4, 41, 19.4, P, 44, 0.6), { tone: "mid" }));
  out.push(L(k.knurl(x, y, 8.4, 41, MIC_TOP, 52, P, 0.3), { tone: "lo" }));
  out.push(L([44, 50.5, 57].map((z) => k.sideArc(x, y, 8.4, z, P, 40)).join(""), { tone: "faint" }));
  out.push(L(k.ring(x, y, 7.2, MIC_TOP, P, 32), { tone: "lo" }));
  return out.join("");
}
const micDiaphragm = () =>
  S(k.cylinder(MIC[0], MIC[1], 5.8, MIC_TOP, 1.2, P, 32, 0.3), { tone: "hi" }) + L(k.ring(MIC[0], MIC[1], 3.4, MIC_TOP + 1.2, P, 24), { tone: "lo" });

// ---- 2 transcribing: a ticker with a paper tape ----
function ticker() {
  const out = [];
  const cx = BOX.x + BOX.w / 2;
  out.push(S(k.slabOf(BOX, 0, BOX_H, P, 6, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BOX, 3), BOX_H, P), { tone: "faint" }));
  out.push(D(k.corners(BOX, 3.6).map(([x, y]) => at([x, y, BOX_H])), { size: 0.45 }));
  const tape = { x: BOX.x + 8, y: -6, w: BOX.w - 16, d: 12, r: 0.6 };
  out.push(S(k.slabOf(tape, BOX_H, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(tape.x + 2, tape.x + tape.w - 2, 2.4, 5, tape.y + 1, BOX_H + 0.6, [1.4, 2.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  for (const x of [BOX.x + 5.4, BOX.x + BOX.w - 5.4]) {
    out.push(S(k.cylinder(x, 0, 3.4, BOX_H, 5, P, 24), { tone: "mid" }));
    out.push(L(k.knurl(x, 0, 3.4, BOX_H, BOX_H + 5, 18, P), { tone: "lo" }));
    out.push(D([at([x, 0, BOX_H + 5])], { size: 0.5, tone: "hi" }));
  }
  const slot = { x: cx - 8, y: BOX.y + BOX.d - 3.2, w: 16, d: 1.8, r: 0.6 };
  out.push(L(k.planOutline(slot, BOX_H, P, 3), { tone: "lo" }));
  const out2 = { x: cx - 5, y: BOX.y + BOX.d, w: 10, d: 24, r: 0.6 };
  out.push(S(k.slabOf(out2, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  for (const y of [BOX.y + BOX.d + 4, BOX.y + BOX.d + 8, BOX.y + BOX.d + 12, BOX.y + BOX.d + 15]) {
    out.push(L(k.lineOnTop([out2.x + 1.8, y], [out2.x + out2.w - 1.8, y], 0.6, P), { tone: "faint", free: true }));
  }
  return out.join("");
}

// ---- 3 thinking: a selector turret whose pointer picks a tool ----
function turret() {
  const out = [];
  const [x, y] = BRAIN;
  out.push(S(k.cylinder(x, y, BRAIN_R, 0, BRAIN_H, P, 72, 0.8), { tone: "mid" }));
  out.push(L(k.ring(x, y, BRAIN_R - 2.6, BRAIN_H, P, 72), { tone: "faint" }));
  out.push(L(k.knurl(x, y, BRAIN_R, 0, BRAIN_H, 96, P, 0.3), { tone: "faint" }));
  const detents = TOOLS.map((tool) => {
    const a = (tool.angle * Math.PI) / 180;
    return at([x + Math.cos(a) * (BRAIN_R - 3.6), y + Math.sin(a) * (BRAIN_R - 3.6), BRAIN_H]);
  });
  out.push(D(detents, { size: 0.8, tone: "hi" }));
  out.push(S(k.cylinder(x, y, DIAL_R, BRAIN_H, DIAL_H, P, 64, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, DIAL_R, DIAL_TOP - 3, DIAL_TOP, 72, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, DIAL_R - 2.4, DIAL_TOP, P, 64), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, DIAL_R - 3, 60, 5, DIAL_TOP, [1.2, 2.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 3.2, DIAL_TOP, 2, P, 20), { tone: "mid" }));
  return out.join("");
}

// ---- 4 calling a tool: three push buttons on the arc the pointer sweeps ----
function pads() {
  return TOOLS.map((tool) => {
    const [x, y] = toolAt(tool);
    const pad = { x: x - 8, y: y - 8, w: 16, d: 16, r: 4 };
    return S(k.slabOf(pad, 0, BTN_Z, P, 6, 0.4), { tone: "lo" }) + D([at([x - 5.6, y - 5.6, BTN_Z]), at([x + 5.6, y + 5.6, BTN_Z])], { size: 0.4 });
  });
}
const button = (tool) => {
  const [x, y] = toolAt(tool);
  return (
    S(k.cylinder(x, y, BTN_R, BTN_Z, BTN_H, P, 28, 0.6), { tone: "mid" }) +
    L(k.ring(x, y, BTN_R - 1.8, BTN_Z + BTN_H, P, 20), { tone: "lo" }) +
    L(k.knurl(x, y, BTN_R, BTN_Z, BTN_Z + BTN_H, 20, P, 0.3), { tone: "faint" })
  );
};

// ---- 5 speaking: a speaker cabinet with a driver cone ----
function speaker() {
  const out = [];
  const [cx, cy] = SPEAKER_C;
  for (const [x, y] of byDepth(k.corners(SPEAKER, 7))) out.push(S(k.cylinder(x, y, 3, 0, 2.4, P, 16), { tone: "lo" }));
  out.push(S(k.slabOf(SPEAKER, 2.4, SPEAKER_H - 2.4, P, 8, 0.9), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(SPEAKER, 3.2), SPEAKER_H, P), { tone: "faint" }));
  out.push(D(k.corners(SPEAKER, 3.2).map(([x, y]) => at([x, y, SPEAKER_H])), { size: 0.45 }));
  out.push(S(k.cylinder(cx, cy, 17.6, SPEAKER_H, 1.6, P, 56, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(cx, cy, 17.6, SPEAKER_H, SPEAKER_H + 1.6, 64, P, 0.2), { tone: "lo" }));
  out.push(L(k.ring(cx, cy, 15.6, SPEAKER_H + 1.6, P, 56), { tone: "lo" }));
  out.push(D(Array.from({ length: 8 }, (_, i) => at([cx + Math.cos((i * Math.PI) / 4 + 0.39) * 16.6, cy + Math.sin((i * Math.PI) / 4 + 0.39) * 16.6, SPEAKER_H + 1.6])), { size: 0.4 }));
  const rear = SPEAKER.x + SPEAKER.w - 5;
  for (const y of [SPEAKER.y + 9, SPEAKER.y + SPEAKER.d - 9]) {
    out.push(S(k.cylinder(rear - 3, y, 2.2, SPEAKER_H, 3.2, P, 16), { tone: "mid" }));
  }
  return out.join("");
}
const cone = () =>
  S(k.cylinder(SPEAKER_C[0], SPEAKER_C[1], 14, CONE_Z, 1.4, P, 48, 0.3), { tone: "hi" }) +
  L(k.ring(SPEAKER_C[0], SPEAKER_C[1], 9, CONE_Z + 1.4, P, 40), { tone: "lo" }) +
  S(k.cylinder(SPEAKER_C[0], SPEAKER_C[1], 4.4, CONE_Z + 1.4, 1.4, P, 24), { tone: "mid" });

// ---- the request: a puck on the front rails, with a flag pointing at the active station ----
function puck(x) {
  const body = { x: x - PUCK.w / 2, y: PUCK_Y, w: PUCK.w, d: PUCK.d, r: PUCK.r };
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(body, 3), PUCK_Z, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(body, PUCK_Z, PUCK_TOP - PUCK_Z, P, 5, 0.6), { tone: "hi", lit: true, crease: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(body, 2.6), PUCK_TOP, P), { tone: "faint" }));
  out.push(S(k.cylinder(x, POST_Y - 5, 1.6, PUCK_TOP, FLAG_Z - PUCK_TOP, P, 16), { tone: "hi", lit: true, crease: "none" }));
  const flag = { x: x - 1.2, y: FLAG_FROM, w: 2.4, d: POST_Y - 5 - FLAG_FROM + 1.2, r: 0.8 };
  out.push(S(k.slabOf(flag, FLAG_Z, 2.2, P, 3), { tone: "hi", lit: true, crease: "none" }));
  out.push(D([at([x, FLAG_FROM + 1.4, FLAG_Z + 2.2])], { size: 0.6, tone: "hi" }));
  return out.join("");
}

const stationsOrdered = [
  ["mic", mic()],
  ["ticker", ticker()],
  ["turret", turret()],
  ["pads", pads().join("")],
];

const needleStyle = 'style="stroke-width:1.2"';
const startAngle = TOOLS[1].angle;
const needlePath = (deg) => {
  const a = (deg * Math.PI) / 180;
  const [cx, cy] = BRAIN;
  return k.lineOnTop([cx - Math.cos(a) * 3.2, cy - Math.sin(a) * 3.2], [cx + Math.cos(a) * (DIAL_R - 3.4), cy + Math.sin(a) * (DIAL_R - 3.4)], DIAL_TOP + 2.2, P);
};

const startX = STAGES[0].x;
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "An assistant like Jarvis built as a bench machine. A request travels left to right on a puck: a microphone hears it, a ticker types it out, a selector turret points at one of three tool buttons, the button is pressed, and a speaker answers.",
  body: [
    plate(),
    rails(),
    stationsOrdered[0][1],
    `<g data-part="diaphragm">${micDiaphragm()}</g>`,
    stationsOrdered[1][1],
    stationsOrdered[2][1],
    `<path data-part="needle" class="iso-line" data-tone="hi" data-free="end" d="${needlePath(startAngle)}" ${needleStyle}/>`,
    stationsOrdered[3][1],
    ...TOOLS.map((tool, i) => `<g data-part="button" data-index="${i}">${button(tool)}</g>`),
    speaker(),
    `<g data-part="cone">${cone()}</g>`,
    `<g data-part="puck" transform="${k.translateAlong(P, [startX, 0, 0])}">${puck(0)}</g>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const STAGES = ${JSON.stringify(STAGES)};
const TOOLS = ${JSON.stringify(TOOLS)};
const BRAIN = ${JSON.stringify(BRAIN)};
const DIAL_R = ${DIAL_R}, DIAL_TOP = ${DIAL_TOP}, PRESS = ${PRESS};
const REACH = ${JSON.stringify(REACH)};
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const puck = svg.querySelector('[data-part="puck"]');
const needle = svg.querySelector('[data-part="needle"]');
const diaphragm = svg.querySelector('[data-part="diaphragm"]');
const cone = svg.querySelector('[data-part="cone"]');
const buttons = [...svg.querySelectorAll('[data-part="button"]')];
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const needlePath = (deg) => {
  const a = (deg * Math.PI) / 180;
  return lineOnTop([BRAIN[0] - Math.cos(a) * 3.2, BRAIN[1] - Math.sin(a) * 3.2], [BRAIN[0] + Math.cos(a) * (DIAL_R - 3.4), BRAIN[1] + Math.sin(a) * (DIAL_R - 3.4)], DIAL_TOP + 2.2, P);
};
const SECONDS = 2.4;
let x = STAGES[0].x, target = x;
let tool = 1, angle = TOOLS[1].angle;
let press = 0, hear = 0, speak = 0;
let frame = 0, last = 0, clock = 0, touring = true, visible = false, idleTimer = 0, spin = 0;
const nearest = (cx) => STAGES.reduce((best, s, i) => (Math.abs(s.x - cx) < Math.abs(STAGES[best].x - cx) ? i : best), 0);
const near = (cx, index) => Math.abs(cx - STAGES[index].x) < 6;
function draw() {
  puck.setAttribute("transform", translateAlong(P, [x, 0, 0]));
  needle.setAttribute("d", needlePath(angle));
  diaphragm.setAttribute("transform", translateAlong(P, [0, 0, Math.sin(spin * 70) * 0.7 * hear]));
  cone.setAttribute("transform", translateAlong(P, [0, 0, Math.sin(spin * 46) * 1.1 * speak]));
  buttons.forEach((node, i) => node.setAttribute("transform", translateAlong(P, [0, 0, i === tool ? -PRESS * press : 0])));
  const here = nearest(x);
  const at = near(x, here);
  let text = at ? (here + 1) + "/5 " + STAGES[here].name : "request in transit";
  if (at && here === 2) text += " → " + TOOLS[tool].name;
  if (at && here === 3) text = "4/5 calling " + TOOLS[tool].name;
  if (at && here === 4) text += " · " + TOOLS[tool].name + " result";
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuenow", String(here + 1));
  stage.setAttribute("aria-valuetext", text);
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  const calm = still.matches;
  spin += dt;
  if (touring) {
    const before = Math.floor(clock / SECONDS);
    clock += dt;
    const step = Math.floor(clock / SECONDS);
    if (step !== before && step % STAGES.length === 0) tool = (tool + 1) % TOOLS.length;
    target = STAGES[step % STAGES.length].x;
  }
  x = calm ? target : x + (target - x) * (1 - Math.exp(-dt / 0.32));
  if (Math.abs(target - x) < 0.01) x = target;
  const wantAngle = TOOLS[tool].angle;
  angle = calm ? wantAngle : angle + (wantAngle - angle) * (1 - Math.exp(-dt / 0.22));
  if (Math.abs(wantAngle - angle) < 0.02) angle = wantAngle;
  const ease = (value, goal) => (calm ? goal : value + (goal - value) * (1 - Math.exp(-dt / 0.12)));
  press = ease(press, near(x, 3) ? 1 : 0);
  hear = ease(hear, near(x, 0) ? 1 : 0);
  speak = ease(speak, near(x, 4) ? 1 : 0);
  if (calm) { hear = near(x, 0) ? 1 : 0; speak = near(x, 4) ? 1 : 0; }
  draw();
  const busy = hear > 0.01 || speak > 0.01 || Math.abs(press - (near(x, 3) ? 1 : 0)) > 0.002;
  const settled = !touring && x === target && angle === wantAngle && !busy;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = next; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = nearest(target) * SECONDS; run(); }, 4200); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
if (still.matches) touring = false;
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  const share = clamp(((event.clientX - box.left) / box.width - 0.1) / 0.8, 0, 1);
  steer(REACH[0] + share * (REACH[1] - REACH[0]));
});
stage.addEventListener("pointerleave", () => steer(target));
stage.addEventListener("click", () => { tool = (tool + 1) % TOOLS.length; steer(target); });
stage.addEventListener("keydown", (event) => {
  const here = nearest(target);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = Math.min(STAGES.length - 1, here + 1);
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = Math.max(0, here - 1);
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = STAGES.length - 1;
  if (event.key === " " || event.key === "Enter") { event.preventDefault(); tool = (tool + 1) % TOOLS.length; steer(target); return; }
  if (to === null) return;
  event.preventDefault();
  steer(STAGES[to].x);
});
draw();
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "Jarvis, on a bench",
  hint: "Hover to move the request",
  readout: "1/5 listening",
  keys: [
    { mark: "lit", label: "The request: where it is is the stage" },
    { mark: "raised", label: "Selector dial and three tool buttons" },
  ],
  caption:
    "A voice assistant as a machine. The request rides the front rail: a microphone hears it, a ticker types it out, the selector turret points at one of three tools, that button is pressed, and the speaker answers with the result. The stages and tools are a simplified model, not a real product.",
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Jarvis: arrow keys move the request between the five stages, space changes the tool" aria-valuemin="1" aria-valuemax="5" aria-valuenow="1">${svg}</div>`,
});

mkdirSync(HERE, { recursive: true });
writeFileSync(join(HERE, file), k.pageHtml({ title: "Jarvis, on a bench", theme, body, script: kitScript() + live, width: 760 }));
console.log("wrote", file);
