import { useId } from "react";

// An architecture diagram drawn from a small spec: boxes at fixed positions
// and straight arrows between them, clipped to the box edges. Colours come from
// the theme tokens, so it follows light and dark mode, and the text is real
// text a screen reader can reach through the description.

export interface DiagramNode {
  id: string;
  label: string;
  // A second, smaller line: where it runs, or what it is.
  note?: string;
  // Centre, in the diagram's own units.
  x: number;
  y: number;
  width?: number;
  kind?: "service" | "store" | "external" | "actor";
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  // An arrowhead at both ends.
  both?: boolean;
  // Bends the edge: the control point sits this far from the straight line's
  // midpoint, to the left of the direction of travel (negative: right).
  curve?: number;
  // Shifts the label, in diagram units.
  labelOffset?: [number, number];
}

export interface DiagramGroup {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramSpec {
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
}

const NODE_WIDTH = 168;
const NODE_HEIGHT = 52;
const NODE_HEIGHT_WITH_NOTE = 64;
const GAP = 6;

const heightOf = (node: DiagramNode) => (node.note ? NODE_HEIGHT_WITH_NOTE : NODE_HEIGHT);

// The point where the line from a box's centre towards (tx, ty) leaves the box.
function exitPoint(node: DiagramNode, tx: number, ty: number): [number, number] {
  const dx = tx - node.x;
  const dy = ty - node.y;
  const halfWidth = (node.width ?? NODE_WIDTH) / 2 + GAP;
  const halfHeight = heightOf(node) / 2 + GAP;
  const scale = Math.min(dx === 0 ? Infinity : halfWidth / Math.abs(dx), dy === 0 ? Infinity : halfHeight / Math.abs(dy));
  return [node.x + dx * scale, node.y + dy * scale];
}

export default function Diagram({ spec, title, description }: { spec: DiagramSpec; title: string; description: string }) {
  const id = useId().replace(/:/g, "");
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));

  return (
    <div className="diagram__scroll">
      <svg
        className="diagram"
        viewBox={`0 0 ${spec.width} ${spec.height}`}
        width={spec.width}
        height={spec.height}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{description}</desc>
        <defs>
          <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="diagram__arrowhead" />
          </marker>
        </defs>

        {spec.groups?.map((group) => (
          <g key={group.label} className="diagram__group">
            <rect x={group.x} y={group.y} width={group.width} height={group.height} rx={10} />
            <text x={group.x + 12} y={group.y + 20}>
              {group.label}
            </text>
          </g>
        ))}

        {spec.edges.map((edge) => {
          const from = nodes.get(edge.from);
          const to = nodes.get(edge.to);
          if (!from || !to) return null;
          // A curved edge leaves each box towards its control point.
          const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
          const cx = (from.x + to.x) / 2 - ((to.y - from.y) / length) * (edge.curve ?? 0);
          const cy = (from.y + to.y) / 2 + ((to.x - from.x) / length) * (edge.curve ?? 0);
          const [x1, y1] = edge.curve ? exitPoint(from, cx, cy) : exitPoint(from, to.x, to.y);
          const [x2, y2] = edge.curve ? exitPoint(to, cx, cy) : exitPoint(to, from.x, from.y);
          const path = edge.curve ? `M${x1},${y1} Q${cx},${cy} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`;
          // The midpoint of the drawn curve, where the label goes.
          const mx = edge.curve ? (x1 + 2 * cx + x2) / 4 : (x1 + x2) / 2;
          const my = edge.curve ? (y1 + 2 * cy + y2) / 4 : (y1 + y2) / 2;
          const [ox, oy] = edge.labelOffset ?? [0, -10];
          return (
            <g key={`${edge.from}-${edge.to}`} className={edge.dashed ? "diagram__edge diagram__edge--dashed" : "diagram__edge"}>
              <path d={path} markerEnd={`url(#${id}-arrow)`} markerStart={edge.both ? `url(#${id}-arrow)` : undefined} />
              {edge.label && (
                <text x={mx + ox} y={my + oy} textAnchor="middle" className="diagram__edge-label">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {spec.nodes.map((node) => {
          const width = node.width ?? NODE_WIDTH;
          const height = heightOf(node);
          return (
            <g key={node.id} className={`diagram__node diagram__node--${node.kind ?? "service"}`}>
              <rect x={node.x - width / 2} y={node.y - height / 2} width={width} height={height} rx={node.kind === "actor" ? height / 2 : 6} />
              <text x={node.x} y={node.note ? node.y - 4 : node.y + 5} textAnchor="middle" className="diagram__label">
                {node.label}
              </text>
              {node.note && (
                <text x={node.x} y={node.y + 16} textAnchor="middle" className="diagram__note">
                  {node.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
