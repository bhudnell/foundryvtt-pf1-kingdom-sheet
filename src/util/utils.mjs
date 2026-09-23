export function findLargestSmallerNumber(arr, num) {
  return arr
    .filter((value) => value < num) // Filter out numbers larger than or equal to the target
    .reduce((largest, current) => {
      return current > largest ? current : largest;
    }, -Infinity); // Initialize with a very small number
}

export function renameKeys(obj, keyMap) {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key; // Use the new key if available, otherwise keep the old key
    acc[newKey] = obj[key];
    return acc;
  }, {});
}

export function asSignedPercent(num) {
  if (num === 0) {
    return "0%";
  }
  return (num > 0 ? "+" : "") + num.toString() + "%";
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Recursively transforms an ES module to a regular, writable object.
 *
 * @internal
 * @template T
 * @param {T} module - The ES module to transform.
 * @returns {T} The transformed module.
 */
export function moduleToObject(module) {
  const result = {};
  for (const key in module) {
    if (Object.prototype.toString.call(module[key]) === "[object Module]") {
      result[key] = moduleToObject(module[key]);
    } else {
      result[key] = module[key];
    }
  }
  return result;
}

export function keepUpdateArray(sourceObj, targetObj, keepPath) {
  const newValue = foundry.utils.getProperty(targetObj, keepPath);
  if (newValue == null) {
    return;
  }
  if (Array.isArray(newValue)) {
    return;
  }

  const newArray = foundry.utils.deepClone(foundry.utils.getProperty(sourceObj, keepPath) || []);

  for (const [key, value] of Object.entries(newValue)) {
    if (foundry.utils.getType(value) === "Object") {
      const subData = foundry.utils.expandObject(value);
      newArray[key] = foundry.utils.mergeObject(newArray[key], subData);
    } else {
      newArray[key] = value;
    }
  }

  foundry.utils.setProperty(targetObj, keepPath, newArray);
}

export class DefaultChange extends pf1.components.ItemChange {
  constructor(formula, target, flavor, options = {}) {
    const data = {
      formula,
      target,
      type: "untyped",
      operator: "add",
      priority: 1000,
      flavor: game.i18n.localize(flavor),
    };

    super(data, options);
  }
}

export function registerSetting(
  { config = true, defaultValue = null, key, scope = "world", settingType = String },
  { skipReady = false } = {}
) {
  const doIt = () =>
    game.settings.register(pf1ks.config.moduleId, key, {
      name: `${pf1ks.config.moduleId}.settings.${key}.name`,
      hint: `${pf1ks.config.moduleId}.settings.${key}.hint`,
      default: defaultValue,
      scope,
      requiresReload: false,
      config,
      type: settingType,
    });

  game.ready || skipReady ? doIt() : Hooks.once("ready", doIt);
}

export function log(msg) {
  console.log(`${pf1ks.config.moduleId} - ${msg}`);
}

export function renderCachedTemplate(path, data = {}) {
  const template = Handlebars.partials[path];
  if (!template) {
    throw new Error(`Template ${path} not found in cache`);
  }

  return template(data, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true,
    preventIndent: true,
  });
}
