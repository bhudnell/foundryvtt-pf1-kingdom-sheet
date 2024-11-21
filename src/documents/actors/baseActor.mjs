import { buffTargets } from "../../config/buffTargets.mjs";
import { CFG } from "../../config/config.mjs";

export class BaseActor extends pf1.documents.actor.ActorBasePF {
  constructor(...args) {
    super(...args);

    if (this.itemFlags === undefined) {
      /**
       * Init item flags.
       */
      this.itemFlags = { boolean: {}, dictionary: {} };
    }

    if (this.changeItems === undefined) {
      /**
       * A list of all the active items with changes.
       *
       * @type {ItemPF[]}
       */
      this.changeItems = [];
    }

    if (this.changes === undefined) {
      /**
       * Stores all ItemChanges from carried items.
       *
       * @public
       * @type {Collection<ItemChange>}
       */
      this.changes = new Collection();
    }

    if (this._rollData === undefined) {
      /**
       * Cached roll data for this item.
       *
       * @internal
       * @type {object}
       */
      this._rollData = null;
    }
  }

  applyActiveEffects() {
    // Apply active effects. Required for status effects in v11 and onward, such as blind and invisible.
    super.applyActiveEffects();
    this._prepareChanges();
  }

  prepareBaseData() {
    this._initialized = false;
    super.prepareBaseData();

    if (Hooks.events.pf1PrepareBaseActorData?.length) {
      Hooks.callAll("pf1PrepareBaseActorData", this);
    }

    /** @type {Record<string, SourceInfo>} */
    this.sourceInfo = {};
    this.changeFlags = {};
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    delete this._rollData;
    pf1.documents.actor.changes.applyChanges.call(this);

    this._initialized = true;
    this._setSourceDetails();
  }

  get _skillTargets() {
    return [];
  }

  refreshDerivedData() {}

  /**
   * Retrieve data used to fill in roll variables.
   *
   * @example
   * await new Roll("1d20 + \@abilities.wis.mod[Wis]", actor.getRollData()).toMessage();
   *
   * @override
   * @param {object} [options] - Additional options
   * @returns {object}
   */
  getRollData(options = { refresh: false }) {
    // Return cached data, if applicable
    const skipRefresh = !options.refresh && this._rollData;

    const result = { ...(skipRefresh ? this._rollData : foundry.utils.deepClone(this.system)) };

    // Clear certain fields if not refreshing
    if (skipRefresh) {
      for (const path of pf1.config.temporaryRollDataFields.actor) {
        foundry.utils.setProperty(result, path, undefined);
      }
    }

    /* ----------------------------- */
    /* Always add the following data
    /* ----------------------------- */

    // Add combat round, if in combat
    if (game.combats?.viewed) {
      result.combat = {
        round: game.combat.round || 0,
      };
    }

    // Return cached data, if applicable
    if (skipRefresh) {
      return result;
    }

    /* ----------------------------- */
    /* Set the following data on a refresh
    /* ----------------------------- */

    // Add item dictionary flags
    result.dFlags = this.itemFlags?.dictionary ?? {};
    result.bFlags = Object.fromEntries(
      Object.entries(this.itemFlags?.boolean ?? {}).map(([key, { sources }]) => [key, sources.length > 0 ? 1 : 0])
    );

    this._rollData = result;

    // Call hook
    if (Hooks.events.pf1GetRollData?.length > 0) {
      Hooks.callAll("pf1GetRollData", this, result);
    }

    return result;
  }

  /**
   * @internal
   * @param {SourceInfo} src - Source info
   */
  static _getSourceLabel(src) {
    return src.name;
  }

  formatContextNotes(notes, rollData, { roll = true } = {}) {
    const result = [];
    rollData ??= this.getRollData();
    for (const noteObj of notes) {
      rollData.item = {};
      if (noteObj.item != null) {
        rollData = noteObj.item.getRollData();
      }

      for (const note of noteObj.notes) {
        result.push(
          ...note.split(/[\n\r]+/).map((subNote) =>
            pf1.utils.enrichHTMLUnrolled(subNote, {
              rollData,
              rolls: roll,
              relativeTo: this,
            })
          )
        );
      }
    }
    return result;
  }

  get allNotes() {
    return this.items
      .filter(
        (item) =>
          item.type.startsWith(`${CFG.id}.`) &&
          item.isActive &&
          (item.system.contextNotes?.length > 0 || item.system._contextNotes?.length > 0)
      )
      .map((item) => {
        const notes = [];
        notes.push(...(item.system.contextNotes ?? []));
        notes.push(...(item.system._contextNotes ?? []));
        return { notes, item };
      });
  }

  // todo this seems fucky
  getContextNotes(context, all = true) {
    if (context.string) {
      context = context.string;
    }
    const result = this.allNotes;

    const notes = result.filter((n) => n.target === context);
    for (const note of result) {
      note.notes = note.notes.filter((o) => o.target === context).map((o) => o.text);
    }

    return result.filter((n) => n.notes.length);
  }

  getContextNotesParsed(context, { roll = true } = {}) {
    const noteObjects = this.getContextNotes(context);
    return noteObjects.reduce((cur, o) => {
      for (const note of o.notes) {
        const enrichOptions = {
          rollData: o.item != null ? o.item.getRollData() : this.getRollData(),
          rolls: roll,
          async: false,
          relativeTo: this,
        };
        cur.push(pf1.utils.enrichHTMLUnrolled(note, enrichOptions));
      }

      return cur;
    }, []);
  }
}