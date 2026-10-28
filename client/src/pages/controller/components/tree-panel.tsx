// Packages
import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  FlaskConical,
  Lock,
  ScrollText,
} from 'lucide-react';
import { itemLabel } from '@halloween/shared/gear';
import { RESOURCES } from '@halloween/shared/items';
import {
  BRANCHES,
  MAX_LEVEL,
  TREE,
  TREE_NODE,
  levelOf,
  nodeUnlocked,
  upgradeCost,
  upgradeEffect,
} from '@halloween/shared/tree';

// Local Imports
import { readStorage, writeStorage } from '../../../helpers/storage';
import { useHold } from '../../../hooks/use-hold';
import ItemDetails from './item-details';
import ItemIcon from './item-icon';
import PanicButton from './panic-button';

// Types
import type { BagItem } from '@halloween/shared/gear';
import type { Inventory, Resource } from '@halloween/shared/items';
import type {
  Branch,
  NodeId,
  TreeNode,
  TreeState,
} from '@halloween/shared/tree';

/**
 * Props for the TreePanel component.
 */
interface TreePanelProps {
  /**
   * Candy and blood carried, to grey out upgrades that can't be paid for.
   */
  inventory: Inventory;

  /**
   * The bag, for the details' costs.
   */
  bag: readonly (BagItem | null)[];

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * Whether the player stands by a research table.
   */
  research: boolean;

  /**
   * Upgrades a node.
   */
  onUpgrade: (node: NodeId) => void;

  /**
   * Closes the tree.
   */
  onBack: () => void;

  /**
   * Makes the player run from monsters close by for a moment, then come
   * back.
   */
  onPanic: () => void;
}

/**
 * Pixels between node columns and rows, and a node's size.
 */
const COL = 62;
const ROW = 74;
const NODE = 46;
const LABEL_ROW = 18;

/**
 * The details sidebar's width: where it starts, the narrowest and widest
 * (as a share of the screen) it can be dragged to, and where the phone
 * remembers it.
 */
const SIDEBAR_WIDTH = 260;
const SIDEBAR_MIN = 160;
const SIDEBAR_MAX_SHARE = 0.6;
const SIDEBAR_KEY = 'graveyard.treeSidebar';

/**
 * Where each node sits: depth is its row (how many upgrades it grows from),
 * and leaves take one column each left to right, roots ordered by branch,
 * with a parent centered over its children.
 */
interface Placed {
  node: TreeNode;
  col: number;
  row: number;
}

const CHILDREN = new Map<NodeId, TreeNode[]>();
for (const n of TREE) {
  if (n.unlock.by === 'upgrade') {
    CHILDREN.set(n.unlock.from, [...(CHILDREN.get(n.unlock.from) ?? []), n]);
  }
}

const BRANCH_ORDER = BRANCHES.map((b: { id: Branch }): Branch => b.id);
const ROOTS = TREE.filter((n: TreeNode): boolean => n.unlock.by !== 'upgrade')
  .sort((a: TreeNode, b: TreeNode): number => BRANCH_ORDER.indexOf(a.branch) - BRANCH_ORDER.indexOf(b.branch));

const PLACED: Placed[] = [];
let nextCol = 0;
function place(node: TreeNode, row: number): number {
  const kids = CHILDREN.get(node.id) ?? [];
  const cols = kids.map((k: TreeNode): number => place(k, row + 1));
  const col = cols.length > 0 ? (cols[0] + cols[cols.length - 1]) / 2 : nextCol++;
  PLACED.push({ node, col, row });
  return col;
}

/**
 * Each branch's label and the columns its roots' subtrees span.
 */
const BRANCH_SPANS: { label: string; from: number; to: number }[] = [];
for (const root of ROOTS) {
  const from = nextCol;
  place(root, 0);
  const label = BRANCHES.find((b: { id: Branch }): boolean => b.id === root.branch)!.label;
  const last = BRANCH_SPANS[BRANCH_SPANS.length - 1];
  if (last?.label === label) {
    last.to = nextCol - 1;
  } else {
    BRANCH_SPANS.push({ label, from, to: nextCol - 1 });
  }
}

const POSITION = new Map(PLACED.map((p: Placed): [NodeId, Placed] => [p.node.id, p]));
const WIDTH = nextCol * COL;
const HEIGHT = LABEL_ROW + (Math.max(...PLACED.map((p: Placed): number => p.row)) + 1) * ROW;

const centerX = (col: number): number => col * COL + COL / 2;
const top = (row: number): number => LABEL_ROW + row * ROW + 4;

/**
 * How much of a node the player can see: open, known but locked (the node
 * it grows from is open), or still hidden.
 */
type Seen = 'open' | 'locked' | 'hidden';

function seenOf(node: TreeNode, tree: TreeState): Seen {
  if (nodeUnlocked(node.id, tree)) {
    return 'open';
  }
  return node.unlock.by === 'upgrade' && nodeUnlocked(node.unlock.from, tree) ? 'locked' : 'hidden';
}

/**
 * What a locked node is waiting for.
 */
function lockReason(node: TreeNode): string {
  const unlock = node.unlock;
  if (unlock.by === 'upgrade') {
    return `Upgrade ${itemLabel(unlock.from)} to Lv ${unlock.level}`;
  }
  return 'Dig up its blueprint';
}

/**
 * Level pips: filled up to `level` of MAX_LEVEL.
 */
function Pips({ level, width }: { level: number; width: string }): React.JSX.Element {
  return (
    <span
      className={`flex gap-0.5 ${width}`}
      aria-label={`Level ${level} of ${MAX_LEVEL}`}>
      {Array.from({ length: MAX_LEVEL }, (_: unknown, i: number) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-sm ${i < level ? 'bg-brand' : 'bg-border'}`} />
      ))}
    </span>
  );
}

/**
 * The player's own skill tree, full screen, kept through death: every
 * node a square icon like the Craft list, linked to the node it grows
 * from, top to bottom. Nodes start known, open when their blueprint is dug
 * up, or open when the node above is upgraded far enough; what isn't in
 * sight yet shows as a question mark. Tap a node to see what upgrading it
 * does and to upgrade it (candy and blood, only by a research table); hold
 * it for its details. The details sidebar is resized by dragging its edge.
 * Back closes it, and Panic gets the player out of trouble while they're
 * looking.
 *
 * @param {TreePanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered screen.
 */
function TreePanel({
  inventory,
  bag,
  tree,
  research,
  onUpgrade,
  onBack,
  onPanic,
}: TreePanelProps): React.JSX.Element {
  const [selected, setSelected] = useState<NodeId>(ROOTS[0].id);
  const [width, setWidth] = useState((): number => Number(readStorage(SIDEBAR_KEY)) || SIDEBAR_WIDTH);
  const drag = useRef<{ x: number; width: number } | null>(null);
  const clamp = (w: number): number => Math.round(Math.max(SIDEBAR_MIN, Math.min(window.innerWidth * SIDEBAR_MAX_SHARE, w)));
  const [details, setDetails] = useState<NodeId | null>(null);
  const hold = useHold<NodeId>((id: NodeId): void => {
    if (seenOf(TREE_NODE[id], tree) !== 'hidden') {
      setDetails(id);
    }
  });

  const node = TREE_NODE[selected];
  const seen = seenOf(node, tree);
  const level = levelOf(selected, tree);
  const cost = upgradeCost(selected, tree);
  const can = seen === 'open' && research && cost !== null && RESOURCES.every((r: Resource): boolean => inventory[r] >= cost[r]);

  return (
    <div className='fixed inset-0 z-10 flex flex-col bg-background'>
      <header className='flex items-center gap-sm border-b border-border px-md py-xsm'>
        <button
          type='button'
          className='flex items-center gap-1 rounded-md border border-border bg-muted px-sm py-1.5 font-pixel text-[8px] text-foreground'
          onClick={onBack}>
          <ArrowLeft size={14} />
          Back
        </button>
        <span className={`flex flex-1 items-center gap-1 font-pixel text-[7px] leading-tight ${research ? 'text-foreground' : 'text-status-warning-foreground'}`}>
          <FlaskConical size={12} />
          {research ? 'At the research table' : 'Stand by a research table to upgrade'}
        </span>
        <PanicButton onPanic={onPanic} />
      </header>
      <div className='flex min-h-0 flex-1'>
        <div className='scrollbar-none min-w-0 flex-1 touch-pan-x touch-pan-y overflow-auto'>
          <div
            className='relative m-sm'
            style={{ width: WIDTH, height: HEIGHT }}>
            <svg
              className='pointer-events-none absolute inset-0'
              width={WIDTH}
              height={HEIGHT}>
              {PLACED.filter((p: Placed): boolean => p.node.unlock.by === 'upgrade').map((p: Placed) => {
                const unlock = p.node.unlock as { from: NodeId };
                const parent = POSITION.get(unlock.from)!;
                const childSeen = seenOf(p.node, tree);
                const x1 = centerX(parent.col);
                const y1 = top(parent.row) + NODE + 8;
                const x2 = centerX(p.col);
                const y2 = top(p.row);
                const mid = (y1 + y2) / 2;
                return (
                  <path
                    key={p.node.id}
                    d={`M${x1} ${y1} V${mid} H${x2} V${y2}`}
                    fill='none'
                    strokeWidth={2}
                    strokeDasharray={childSeen === 'hidden' ? '3 4' : undefined}
                    className={childSeen === 'open' ? 'stroke-brand' : childSeen === 'locked' ? 'stroke-foreground-muted' : 'stroke-border'} />
                );
              })}
            </svg>
            {BRANCH_SPANS.map(({ label, from, to }) => (
              <span
                key={label}
                className='absolute top-0 truncate border-b border-border text-center font-pixel text-[6px] leading-[12px] text-foreground-muted'
                style={{ left: from * COL + 4, width: (to - from + 1) * COL - 8 }}>
                {label}
              </span>
            ))}
            {PLACED.map(({ node: n, col, row }: Placed) => {
              const nSeen = seenOf(n, tree);
              return (
                <button
                  key={n.id}
                  type='button'
                  aria-label={nSeen === 'hidden' ? 'Unknown' : itemLabel(n.id)}
                  aria-pressed={selected === n.id}
                  className={`absolute flex items-center justify-center rounded-[2px] border bg-surface ${selected === n.id ? 'border-brand ring-1 ring-brand' : 'border-border'}`}
                  style={{ left: centerX(col) - NODE / 2, top: top(row), width: NODE, height: NODE }}
                  {...hold.bind(n.id)}
                  onClick={(): void => {
                    if (hold.tapped()) {
                      setSelected(n.id);
                    }
                  }}>
                  {nSeen === 'hidden' ? (
                    <span className='font-pixel text-sm text-foreground-subtle'>?</span>
                  ) : (
                    <ItemIcon
                      item={n.id}
                      size={38}
                      className={nSeen === 'open' ? '' : 'opacity-40'} />
                  )}
                  {nSeen === 'locked' && (
                    <Lock
                      size={9}
                      className='absolute right-0.5 top-0.5 text-foreground-muted' />
                  )}
                  {nSeen === 'hidden' && n.unlock.by === 'blueprint' && (
                    <ScrollText
                      size={9}
                      className='absolute right-0.5 top-0.5 text-foreground-subtle' />
                  )}
                  {nSeen === 'open' && (
                    <span className='absolute -bottom-2.5 inset-x-1'>
                      <Pips
                        level={levelOf(n.id, tree)}
                        width='w-full' />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div
          role='separator'
          aria-orientation='vertical'
          aria-label='Drag to resize'
          className='flex w-3 shrink-0 cursor-col-resize touch-none items-center justify-center border-l border-border'
          onPointerDown={(e: React.PointerEvent<HTMLDivElement>): void => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, width };
          }}
          onPointerMove={(e: React.PointerEvent<HTMLDivElement>): void => {
            if (drag.current) {
              setWidth(clamp(drag.current.width + drag.current.x - e.clientX));
            }
          }}
          onPointerUp={(): void => {
            drag.current = null;
            writeStorage(SIDEBAR_KEY, String(width));
          }}>
          <span className='h-8 w-0.5 rounded-full bg-border' />
        </div>
        <aside
          className='flex shrink-0 flex-col gap-sm p-sm'
          style={{ width: clamp(width) }}>
          {seen === 'hidden' ? (
            <>
              <span className='font-pixel text-[9px] leading-tight text-foreground'>???</span>
              <span className='font-pixel text-[7px] leading-relaxed text-foreground-muted'>
                {node.unlock.by === 'blueprint' ? 'A blueprint is buried somewhere.' : 'Upgrade what it grows from to see it.'}
              </span>
            </>
          ) : (
            <>
              <div className='flex items-center gap-1'>
                <ItemIcon
                  item={selected}
                  size={30}
                  className={seen === 'open' ? '' : 'opacity-40'} />
                <span className='font-pixel text-[9px] leading-tight text-foreground'>{itemLabel(selected)}</span>
              </div>
              {seen === 'open' ? (
                <>
                  <Pips
                    level={level}
                    width='w-full' />
                  {cost !== null && (
                    <span className='font-pixel text-[7px] leading-relaxed text-foreground-muted'>
                      Next level:
                      {' '}
                      {upgradeEffect(selected)}
                    </span>
                  )}
                  <button
                    type='button'
                    disabled={!can}
                    aria-label={cost === null ? 'Maxed' : `Upgrade for ${cost.candy} candy and ${cost.blood} blood`}
                    className='flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted py-1 font-pixel text-[8px] text-foreground transition-opacity disabled:opacity-40'
                    onClick={(): void => onUpgrade(selected)}>
                    {cost === null ? 'MAX' : (
                      <>
                        Upgrade
                        {RESOURCES.map((r: Resource) => (
                          <span
                            key={r}
                            className='flex items-center'>
                            <ItemIcon
                              item={`res:${r}`}
                              size={16} />
                            {cost[r]}
                          </span>
                        ))}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <span className='flex items-start gap-1 font-pixel text-[7px] leading-relaxed text-foreground-muted'>
                  <Lock
                    size={10}
                    className='mt-0.5 shrink-0' />
                  {lockReason(node)}
                </span>
              )}
              <span className='mt-auto font-pixel text-[6px] leading-relaxed text-foreground-subtle'>Hold a node for details</span>
            </>
          )}
        </aside>
      </div>
      {details && (
        <ItemDetails
          item={details}
          tree={tree}
          inventory={inventory}
          bag={bag}
          onClose={(): void => setDetails(null)} />
      )}
    </div>
  );
}

export default TreePanel;
