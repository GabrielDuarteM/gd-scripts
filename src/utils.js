// @ts-check

const fs = require("fs")
const path = require("path")
const arrify = require("arrify")
const has = require("lodash.has")
const readPkgUp = require("read-pkg-up")
const which = require("which")

const { pkg, path: pkgPath } = readPkgUp.sync({
  cwd: fs.realpathSync(process.cwd()),
})
const appDirectory = path.dirname(pkgPath)

const isGdScripts = () => pkg.name === "gd-scripts"

/**
 * @param {string} modName
 * @param {{ executable?: string, cwd?: string }} options
 */
const resolveBin = (
  modName,
  { executable = modName, cwd = process.cwd() } = {},
) => {
  let pathFromWhich
  try {
    pathFromWhich = fs.realpathSync(which.sync(executable))
  } catch (_error) {
    // ignore _error
  }
  try {
    const modPkgPath = require.resolve(`${modName}/package.json`)
    const modPkgDir = path.dirname(modPkgPath)
    const { bin } = require(modPkgPath)
    const binPath = typeof bin === "string" ? bin : bin[executable]
    const fullPathToBin = path.join(modPkgDir, binPath)
    if (fullPathToBin === pathFromWhich) {
      return executable
    }
    return fullPathToBin.replace(cwd, ".")
  } catch (error) {
    if (pathFromWhich) {
      return executable
    }
    throw error
  }
}

/**
 * @param {string[]} p
 */
const fromRoot = (...p) => path.join(appDirectory, ...p)
/**
 * @param {string[]} p
 */
const hasFile = (...p) => fs.existsSync(fromRoot(...p))

/**
 * @param {any} props
 */
const hasPkgProp = props => arrify(props).some(prop => has(pkg, prop))

/**
 * @param {string} pkgProp
 * @returns {function(any): boolean}
 */
const hasPkgSubProp = pkgProp => props =>
  hasPkgProp(arrify(props).map(p => `${pkgProp}.${p}`))

const hasPeerDep = hasPkgSubProp("peerDependencies")
const hasDep = hasPkgSubProp("dependencies")
const hasDevDep = hasPkgSubProp("devDependencies")
/**
 * @param {any} args
 */
const hasAnyDep = args => [hasDep, hasDevDep, hasPeerDep].some(fn => fn(args))
/**
 * @param {any} deps
 * @param {any} t
 * @param {any} f
 */
const ifAnyDep = (deps, t, f) => (hasAnyDep(arrify(deps)) ? t : f)

/**
 * @param {string} name
 */
const envIsSet = name =>
  process.env.hasOwnProperty(name) &&
  process.env[name] &&
  process.env[name] !== "undefined"

/**
 * @param {string} name
 * @param {string} def
 */
const parseEnv = (name, def) => {
  if (envIsSet(name)) {
    try {
      return JSON.parse(/** @type {any} */ (process.env[name]))
    } catch (err) {
      return process.env[name]
    }
  }
  return def
}

module.exports = {
  appDirectory,
  resolveBin,
  fromRoot,
  hasFile,
  hasPkgProp,
  ifAnyDep,
  parseEnv,
  envIsSet,
  isGdScripts,
}