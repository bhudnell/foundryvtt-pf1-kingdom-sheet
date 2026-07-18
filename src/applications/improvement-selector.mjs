import { moduleId } from "../config/config.mjs";
import { validateImprovement } from "../util/utils.mjs";

export class ImprovementSelector extends pf1.applications.ActorTraitSelector {
  static PARTS = foundry.utils.mergeObject(super.PARTS, {
    form: {
      template: `modules/${moduleId}/templates/apps/improvement-selector.hbs`,
    },
  });

  async _preparePartContext(partId) {
    if (partId === "footer") {
      if (!this.isEditable) {
        return {};
      } // No update button if not editable

      return {
        buttons: [
          {
            type: "submit",
            label: "PF1KS.UpdateHex",
            icon: "fa-regular fa-floppy-disk",
          },
        ],
      };
    }

    const context = await super._preparePartContext(partId);

    if (context.choices) {
      Object.keys(context.choices).forEach((choice) => {
        const improvementContext = {
          ...this.options.hex,
          kingdom: this.options.kingdom,
        };

        // replace the hex's data with the current selection
        if (this.options.subject === "terrainImprovements") {
          improvementContext.improvements = Array.from(this.attributes.standard);
        } else {
          improvementContext.features = Array.from(this.attributes.standard);
        }

        const { valid, failures } = validateImprovement(pf1ks.config[this.options.subject][choice], improvementContext);
        context.choices[choice].invalid = !valid;
        context.choices[choice].error = failures.join("; ");
      });
    }

    return context;
  }
}
