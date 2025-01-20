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

    this.prepareConditions();

    this._prepareChanges();
  }

  prepareBaseData() {
    this._initialized = false;
    super.prepareBaseData();

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
    const allNotes = this.items
      .filter(
        (item) =>
          item.type.startsWith(`${pf1ks.config.moduleId}.`) && item.isActive && item.system.contextNotes?.length > 0
      )
      .map((item) => {
        const notes = [];
        notes.push(...(item.system.contextNotes ?? []));
        return { notes, item };
      });

    // add condition notes
    for (const [con, v] of Object.entries(this.system.conditions)) {
      if (!v) {
        continue;
      }
      const condition = pf1ks.config.armyConditions[con];
      if (!condition) {
        continue;
      }

      const mechanic = condition.mechanics;
      if (!mechanic) {
        continue;
      }

      const conditionNotes = [];
      for (const note of mechanic.contextNotes ?? []) {
        conditionNotes.push(new pf1.components.ContextNote(note, { parent: this }));
      }
      allNotes.push({ notes: conditionNotes, item: null });
    }

    return allNotes;
  }

  getContextNotes(context, settlementId) {
    if (context.string) {
      context = context.string;
    }
    const result = this.allNotes;

    for (const note of result) {
      note.notes = note.notes
        .filter((o) => o.target === context && o.parent.system.settlementId === settlementId)
        .map((o) => o.text);
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

  _prepareChanges() {
    const changes = [];

    this._addDefaultChanges(changes);

    this._addConditionChanges(changes);

    this.changeItems = this.items.filter(
      (item) =>
        item.type.startsWith(`${pf1ks.config.moduleId}.`) &&
        item.hasChanges &&
        item.isActive &&
        (item.type !== pf1ks.config.buildingId || item.system.settlementId) // buildings must have a settlement ID to count
    );

    for (const i of this.changeItems) {
      changes.push(...i.changes);
    }

    const c = new Collection();
    for (const change of changes) {
      // Avoid ID conflicts
      const parentId = change.parent?.id ?? "Actor";
      const uniqueId = `${parentId}-${change._id}`;
      c.set(uniqueId, change);
    }
    this.changes = c;
  }

  _addConditionChanges(changes) {
    for (const [con, v] of Object.entries(this.system.conditions)) {
      if (!v) {
        continue;
      }
      const condition = pf1ks.config.armyConditions[con];
      if (!condition) {
        continue;
      }

      const mechanic = condition.mechanics;
      if (!mechanic) {
        continue;
      }

      for (const change of mechanic.changes ?? []) {
        const changeData = { ...change, flavor: condition.name };
        const changeObj = new pf1.components.ItemChange(changeData);
        changes.push(changeObj);
      }
    }
  }

  async toggleCondition(conditionId, aeData) {
    let active = !this.hasCondition(conditionId);
    if (active && aeData) {
      active = aeData;
    }
    return this.setCondition(conditionId, active);
  }

  async setCondition(conditionId, enabled, context) {
    if (typeof enabled !== "boolean" && foundry.utils.getType(enabled) !== "Object") {
      throw new TypeError("Actor.setCondition() enabled state must be a boolean or plain object");
    }
    return this.setConditions({ [conditionId]: enabled }, context);
  }

  hasCondition(conditionId) {
    return this.statuses.has(conditionId);
  }

  async setConditions(conditions = {}, context = {}) {
    conditions = foundry.utils.deepClone(conditions);

    // Create update data
    const toDelete = [],
      toCreate = [];

    for (const [conditionId, value] of Object.entries(conditions)) {
      const currentCondition = pf1ks.config.armyConditions[conditionId];
      if (currentCondition === undefined) {
        console.error("Unrecognized condition:", conditionId);
        delete conditions[conditionId];
        continue;
      }

      const oldAe = this.hasCondition(conditionId) ? this.effects.find((ae) => ae.statuses.has(conditionId)) : null;

      // Create
      if (value) {
        if (!oldAe) {
          const aeData = {
            flags: {
              pf1: {
                autoDelete: true,
              },
            },
            statuses: [conditionId],
            name: currentCondition.name,
            icon: currentCondition.texture,
            label: currentCondition.name,
          };

          // Special boolean for easy overlay
          if (value?.overlay) {
            delete value.overlay;
            foundry.utils.setProperty(aeData.flags, "core.overlay", true);
          }

          if (typeof value !== "boolean") {
            foundry.utils.mergeObject(aeData, value);
          }

          toCreate.push(aeData);
        } else {
          delete conditions[conditionId];
        }
      }
      // Delete
      else {
        if (oldAe) {
          toDelete.push(oldAe.id);
        } else {
          delete conditions[conditionId];
        }
      }
    }

    // Perform updates
    // Inform update handlers they don't need to do work
    if (toDelete.length) {
      const deleteContext = foundry.utils.deepClone(context);
      // Prevent double render
      if (context.trender && toCreate.length) {
        deleteContext.render = false;
      }
      // Without await the deletions may not happen at all, presumably due to race condition, if AEs are also created.
      await this.deleteEmbeddedDocuments("ActiveEffect", toDelete, deleteContext);
    }
    if (toCreate.length) {
      const createContext = foundry.utils.deepClone(context);
      await this.createEmbeddedDocuments("ActiveEffect", toCreate, createContext);
    }

    return conditions;
  }
}
