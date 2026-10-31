// Packages
import React from 'react';
import { FOLLOW_TALL } from '@halloween/renderer/world/camera/config/camera';
import { DISPLAY_RANGES } from '@halloween/renderer/world/config/display-settings';

// Local Imports
import {
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_MAX,
  PIXEL_SIZE_MIN,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../../config/bindings';
import {
  CAMERA_LEAD_DEFAULT,
  CAMERA_LEAD_RANGE,
  CAMERA_LEAD_SPEED_DEFAULT,
  CAMERA_LEAD_SPEED_RANGE,
  DISPLAY_SWITCHES,
  PLAY_DISPLAY_DEFAULTS,
  UI_SCALE_DEFAULT,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_STEP,
} from '../../config/settings';
import { percent, sameSetting } from '../../helpers/settings-values';
import RangeSetting from './range-setting';
import SectionHeader from './section-header';
import SubsectionTitle from './subsection-title';
import SwitchSetting from './switch-setting';

// Types
import type {
  DisplayFlag,
  DisplayNumber,
  DisplaySettings,
} from '@halloween/renderer/types/display-settings';
import type { PlaySettings } from '../../types/play';

/**
 * Props for GraphicsSettings.
 */
interface GraphicsSettingsProps {
  /**
   * The current settings.
   */
  settings: PlaySettings;

  /**
   * Called with the changed settings.
   */
  onChange: (settings: PlaySettings) => void;
}

/**
 * Whether every Graphics setting is at its default.
 *
 * @param settings - The settings.
 * @returns Whether there's nothing to reset.
 */
const graphicsAtDefault = (settings: PlaySettings): boolean => settings.zoom === FOLLOW_TALL
  && settings.pixelSize === PIXEL_SIZE_DEFAULT
  && sameSetting(settings.uiScale, UI_SCALE_DEFAULT)
  && sameSetting(settings.cameraLead, CAMERA_LEAD_DEFAULT)
  && sameSetting(settings.cameraLeadSpeed, CAMERA_LEAD_SPEED_DEFAULT)
  && (Object.keys(PLAY_DISPLAY_DEFAULTS) as (keyof DisplaySettings)[]).every((k: keyof DisplaySettings): boolean => settings.display[k] === PLAY_DISPLAY_DEFAULTS[k]);

/**
 * The Graphics tab, in subsections: View (how close and tilted the camera
 * is, how big the menus are, and how far ahead of the player the camera
 * looks and how fast that swings round), Lighting (brightness, glow),
 * Models (blood, turn speed, small details), Filters (pixelation,
 * aberration, fog, shake), and UI (pickups, names, health bars, the TPS,
 * FPS, and tick overlay). Each row resets on its own, and Reset all puts
 * the whole tab back.
 *
 * @param {GraphicsSettingsProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tab.
 */
function GraphicsSettings({ settings, onChange }: GraphicsSettingsProps): React.JSX.Element {
  const display = settings.display;
  /**
   * Changes some display settings.
   *
   * @param patch - What changes.
   */
  const setDisplay = (patch: Partial<DisplaySettings>): void => onChange({ ...settings, display: { ...display, ...patch } });
  /**
   * One display slider row.
   *
   * @param key - The setting.
   * @param label - Its name.
   * @param readout - What a value reads as.
   * @param note - A line under it, if any.
   * @returns The row.
   */
  const slider = (key: DisplayNumber, label: string, readout: (v: number) => string, note?: string): React.JSX.Element => (
    <RangeSetting
      key={key}
      label={label}
      value={display[key]}
      defaultValue={PLAY_DISPLAY_DEFAULTS[key]}
      min={DISPLAY_RANGES[key].min}
      max={DISPLAY_RANGES[key].max}
      step={DISPLAY_RANGES[key].step}
      readout={readout}
      downLabel={`${label} down`}
      upLabel={`${label} up`}
      note={note}
      onChange={(v: number): void => setDisplay({ [key]: v })} />
  );
  /**
   * A share as a percentage, Off at 0.
   *
   * @param v - The value.
   * @returns The text.
   */
  const offOr = (v: number): string => percent(v, 'Off');

  return (
    <div className='flex flex-col gap-sm'>
      <SectionHeader
        title='Graphics'
        resetLabel='Reset all'
        atDefault={graphicsAtDefault(settings)}
        onReset={(): void => onChange({ ...settings, zoom: FOLLOW_TALL, pixelSize: PIXEL_SIZE_DEFAULT, uiScale: UI_SCALE_DEFAULT, cameraLead: CAMERA_LEAD_DEFAULT, cameraLeadSpeed: CAMERA_LEAD_SPEED_DEFAULT, display: { ...PLAY_DISPLAY_DEFAULTS } })} />
      <SubsectionTitle title='View' />
      <RangeSetting
        label='View scale'
        value={settings.zoom}
        defaultValue={FOLLOW_TALL}
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        step={ZOOM_STEP}
        readout={(v: number): string => `${v} tiles tall`}
        downLabel='Zoom in'
        upLabel='Zoom out'
        onChange={(zoom: number): void => onChange({ ...settings, zoom })} />
      {slider('viewAngle', 'View angle', (v: number): string => `${v}°`)}
      <RangeSetting
        label='UI scale'
        value={settings.uiScale}
        defaultValue={UI_SCALE_DEFAULT}
        min={UI_SCALE_MIN}
        max={UI_SCALE_MAX}
        step={UI_SCALE_STEP}
        readout={(v: number): string => percent(v)}
        downLabel='Smaller menus'
        upLabel='Bigger menus'
        onChange={(uiScale: number): void => onChange({ ...settings, uiScale })} />
      <RangeSetting
        label='Camera lead'
        value={settings.cameraLead}
        defaultValue={CAMERA_LEAD_DEFAULT}
        min={CAMERA_LEAD_RANGE.min}
        max={CAMERA_LEAD_RANGE.max}
        step={CAMERA_LEAD_RANGE.step}
        readout={(v: number): string => percent(v, 'Centered')}
        downLabel='Less room ahead'
        upLabel='More room ahead'
        note='How much more of the ground ahead of you shows than behind'
        onChange={(cameraLead: number): void => onChange({ ...settings, cameraLead })} />
      <RangeSetting
        label='Camera lead speed'
        value={settings.cameraLeadSpeed}
        defaultValue={CAMERA_LEAD_SPEED_DEFAULT}
        min={CAMERA_LEAD_SPEED_RANGE.min}
        max={CAMERA_LEAD_SPEED_RANGE.max}
        step={CAMERA_LEAD_SPEED_RANGE.step}
        readout={(v: number): string => percent(v / CAMERA_LEAD_SPEED_DEFAULT)}
        downLabel='Slower lead'
        upLabel='Faster lead'
        note='How quickly the view swings round when you turn'
        onChange={(cameraLeadSpeed: number): void => onChange({ ...settings, cameraLeadSpeed })} />
      <SubsectionTitle title='Lighting' />
      {slider('brightness', 'Brightness', (v: number): string => percent(v))}
      {slider('glow', 'Glow', offOr)}
      <SubsectionTitle title='Models' />
      {slider('blood', 'Blood', (v: number): string => percent(v, 'None'))}
      {slider('turnSpeed', 'Turn speed', (v: number): string => `${Math.round((v * 180) / Math.PI)}°/s`)}
      {slider('details', 'Small details', (v: number): string => percent(v))}
      <SubsectionTitle title='Filters' />
      <RangeSetting
        label='Pixelation'
        value={settings.pixelSize}
        defaultValue={PIXEL_SIZE_DEFAULT}
        min={PIXEL_SIZE_MIN}
        max={PIXEL_SIZE_MAX}
        step={1}
        readout={(v: number): string => (v === 1 ? 'Smooth' : `${v} px up close`)}
        downLabel='Finer pixels'
        upLabel='Bigger pixels'
        onChange={(pixelSize: number): void => onChange({ ...settings, pixelSize })} />
      {slider('aberration', 'Chromatic aberration', offOr)}
      {slider('fog', 'Fog', offOr)}
      {slider('shake', 'Screen shake', offOr)}
      <SubsectionTitle title='UI' />
      {DISPLAY_SWITCHES.map(({ key, label }: { key: DisplayFlag; label: string }) => (
        <SwitchSetting
          key={key}
          label={label}
          on={display[key]}
          defaultOn={PLAY_DISPLAY_DEFAULTS[key]}
          onChange={(on: boolean): void => setDisplay({ [key]: on })} />
      ))}
    </div>
  );
}

export default GraphicsSettings;
