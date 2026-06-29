/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceLibItem {
  key: string;
  name: string;
  defaultW: number;
  warnAbove: number;
}

export interface ListItem {
  id: string;
  name: string;
  w: number;
  qty: number;
  warnAbove?: number;
  source: 'lib' | 'custom';
}
