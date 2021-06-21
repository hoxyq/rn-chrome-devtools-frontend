// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export abstract class Linkifier {
  abstract linkify(object: Object, options?: Options): Node;

  static async linkify(object: Object|null, options?: Options): Promise<Node> {
    if (!object) {
      throw new Error('Can\'t linkify ' + object);
    }
    const linkifierRegistration = getApplicableRegisteredlinkifiers(object)[0];
    if (!linkifierRegistration) {
      throw new Error('No linkifiers registered for object ' + object);
    }
    const linkifier = await linkifierRegistration.loadLinkifier();
    return linkifier.linkify(object, options);
  }
}
export interface Options {
  tooltip?: string;
  preventKeyboardFocus?: boolean;
}

const registeredLinkifiers: LinkifierRegistration[] = [];

export function registerLinkifier(registration: LinkifierRegistration): void {
  registeredLinkifiers.push(registration);
}

export function getApplicableRegisteredlinkifiers(object: Object): LinkifierRegistration[] {
  return registeredLinkifiers.filter(isLinkifierApplicableToContextTypes);

  function isLinkifierApplicableToContextTypes(linkifierRegistration: LinkifierRegistration): boolean {
    if (!linkifierRegistration.contextTypes) {
      return true;
    }
    for (const contextType of linkifierRegistration.contextTypes()) {
      // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
      // @ts-expect-error
      if (object instanceof contextType) {
        return true;
      }
    }
    return false;
  }
}
export interface LinkifierRegistration {
  loadLinkifier: () => Promise<Linkifier>;
  contextTypes?: (() => Array<unknown>);
}
