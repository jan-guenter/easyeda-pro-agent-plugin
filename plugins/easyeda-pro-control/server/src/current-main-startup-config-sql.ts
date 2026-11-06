/** Exact startup configuration SQL comparison data. A match is descriptive;
 * only an original source/connection/call-frame owner can continue a native call.
 * Cookie parameters are never returned, hashed, stringified or logged here. */
import { createHash } from "node:crypto";
import { types } from "node:util";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentMainStartupConfigRole = "jb" | "dc";
export type CurrentMainStartupConfigSqlSite = "run" | "prepare" | "prepared" | "statementRun" | "finalize";
export const CURRENT_MAIN_STARTUP_CONFIG_SQL = freezeDeep({
  "requiredWebDbVersion": "25.10.31.1",
  "sourceRows": {
    "Q": {
      "start": 1_291_956,
      "end": 1_292_305,
      "bytes": 349,
      "sha256": "a0927d35f5ff09abd9efc7a90bdd8439f70255a74591e37996f94f9c709e0d22",
      "lineNumber": 1020,
      "columnNumber": 12_658
    },
    "Jr": {
      "start": 1_292_306,
      "end": 1_292_376,
      "bytes": 70,
      "sha256": "fc6f935bef409dd79dce408922bb80327ccba04b79a4048b9cf228014008b613",
      "lineNumber": 1020,
      "columnNumber": 13_008
    },
    "d": {
      "start": 1_292_377,
      "end": 1_292_429,
      "bytes": 52,
      "sha256": "07a8b421bacebf42aaf849386aa3d9fe1bcba1ad2346c3a10b65916ed0a1d408",
      "lineNumber": 1020,
      "columnNumber": 13_079
    },
    "ji": {
      "start": 1_292_430,
      "end": 1_292_474,
      "bytes": 44,
      "sha256": "bb36eab116d116cc60d3ba3f87d464cd04598620868c77f2d2aa14871b0eb5a9",
      "lineNumber": 1020,
      "columnNumber": 13_132
    },
    "wo": {
      "start": 1_292_474,
      "end": 1_292_705,
      "bytes": 231,
      "sha256": "731b4bbeafe74c6b71a3cdcdaf3923a98c2e53018c95202080f10ed487dd8557",
      "lineNumber": 1020,
      "columnNumber": 13_176
    },
    "Da": {
      "start": 1_292_705,
      "end": 1_292_791,
      "bytes": 86,
      "sha256": "71d81cb5dde1a0afc003e168fe1f3cb6dbb36e99cfabf3d1c46f315b7699a5af",
      "lineNumber": 1020,
      "columnNumber": 13_407
    },
    "D5": {
      "start": 1_292_791,
      "end": 1_299_105,
      "bytes": 6314,
      "sha256": "c3e085daa38ff281385c20e22c1faea33a4a5ad2052265a4ac56e9c6c158ddb9",
      "lineNumber": 1020,
      "columnNumber": 13_493
    },
    "h6": {
      "start": 1_368_724,
      "end": 1_373_660,
      "bytes": 4936,
      "sha256": "4a73b50e63547216b34f8707b7f726e3cdb7e1efcbf279948f55bb6e49be2da2",
      "lineNumber": 1084,
      "columnNumber": 1958
    },
    "hn": {
      "start": 1_374_277,
      "end": 1_374_361,
      "bytes": 84,
      "sha256": "d7c2fdf65e7d1b9ce9d76663089bc56e202755c6d059e3ed4472c9a04ac4f159",
      "lineNumber": 1164,
      "columnNumber": 743
    },
    "JB": {
      "start": 2_621_717,
      "end": 2_621_990,
      "bytes": 273,
      "sha256": "5f1c111205876e9ba0aa8637737bb934118945c23ae2614f6b2acd999583ed87",
      "lineNumber": 8573,
      "columnNumber": 19_264
    },
    "RC": {
      "start": 2_625_381,
      "end": 2_625_491,
      "bytes": 110,
      "sha256": "d1ffe3c866a62de113501454a367aaaae1ebdb07e50dbd842fb648a09de74785",
      "lineNumber": 8573,
      "columnNumber": 22_928
    },
    "KB": {
      "start": 2_625_492,
      "end": 2_625_801,
      "bytes": 309,
      "sha256": "df6923c2e318664b761f04d20f17d616b1725300946a06143c7bbc459c102346",
      "lineNumber": 8573,
      "columnNumber": 23_039
    },
    "DC": {
      "start": 2_625_802,
      "end": 2_626_738,
      "bytes": 936,
      "sha256": "ceb65d72d7f5c64ec308cf6660fbd86546b0e672311be62924f03a6120a1c801",
      "lineNumber": 8583,
      "columnNumber": 2
    }
  },
  "scripts": {
    "jb": [
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Create Date','Text','SheetSymbol','{}');",
        "sha256": "36fb967e190af66b5e5af9f1f631f96b04f0274387e5a9ee381d96c550d5b006"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Page Count','Text','SheetSymbol','{}');",
        "sha256": "0cae282254d73eb99760c4c863c193b5eb73228778ad825cae1f6868c3fb24b6"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Page No','Text','SheetSymbol','{\"sch\":[0,1],\"pcb\":[0,0]}');",
        "sha256": "7be20150a2c8cdfa2f19f68d0d79a9ea5b5078b2ffb097aed9634ec6d038df48"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Project Name','Text','SheetSymbol','{}');",
        "sha256": "503470120a39ea0e015479f21762ac8d5509091bf040250d1733b9572f747f49"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Schematic Name','Text','SheetSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "698ed90495c6b737c513bb99ce1624f76ed4450b27583474a3a0f5605ae4989a"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Update Date','Text','SheetSymbol','{}');",
        "sha256": "028f36e5fcdfd2dff673d340727ae8b5541213809bbacdef9f090e436fc5022e"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Company','Text','SheetSymbol','{}');",
        "sha256": "e8e2664b2d8057aba66fa7dd81140be6702f95bbc3e446e0c0ab6d2adf23d940"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Height','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "7080915db2f896e2383ec9ad35ca3759cded7dd243df60ada175240729e2ccdd"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Designator','Text','ComponentSymbol,Footprint,BlockSymbol','{\"sch\":[0,1],\"pcb\":[0,1]}');",
        "sha256": "711b61cd79c001c971651bcd4dadc78f1a5f0b0796427d13e42bf1754fc4a30b"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Comment','Text','ComponentSymbol,Footprint,BlockSymbol','{\"sch\":[0,1],\"pcb\":[0,1]}');",
        "sha256": "f181a1c375765dc934e52297e9e38f7509cb7b4ef70a544073e9a7c795ad260d"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Device','Text','ComponentSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "1aecdd0751a54cf465e41c8ffbc8b82013b29a6c62b557c23b139c7fa82c61ac"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Drawed','Text','SheetSymbol','{}');",
        "sha256": "a72e1a0a15cd39b5e3aae19d1742d251ef7aeca774260687e3cdf5f4a6b9cc3f"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Footprint','Text','ComponentSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "a885bf96a499fbd8372621fcb1341b91aa9621c31bb382de5c50d0a89a351715"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Manufacturer','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint,Component','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "72da9da8cafccf2602433dd6ee16b9f974553e5c53840e724f2b41295dd277b0"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Manufacturer Part','Text','ComponentSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "d8f7261156c4842ca8a915d4f97af5279d56c1468a4a2a7ec5d4b3898735d751"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Page Size','Text','SheetSymbol','{}');",
        "sha256": "8a4f2c2bfa3d44690981ec4b59ee432d419355891dee7d97653ebb131d06e704"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Price','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "2369e2ba591ac8bef1578563157478e18b6363508a70135840de42751c392331"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Resistance','Text','ComponentSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "94321622d7c1e0d00871ece70143815bbf7903d3d4ee0ad2aa8e7fdb61e744f0"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Reviewed','Text','SheetSymbol','{}');",
        "sha256": "af4454876e158b64700c868418cc3026f1218280fc1bec12fb6f97e5f627601d"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Stock','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "788b8e2aa6091b605a577ebedaa365c8b2af65e83c63da96f14ff8f0e5aa05d7"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Supplier','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "19d655b36f2044e4ee05298501700cb207225f3987adb2c4b90c81c80c85dc83"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Supplier Part','Text','ComponentSymbol,BlockSymbol,NoneElecSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "edffc71831ca8e8e9955c0feb401e7481fbbd8659029b22553c5301bc6765731"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Symbol','Text','ComponentSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "5c42ef5e3e2b49ac09baa73b5997c79c8936bdca90aea8c79c68eed3b6358bfa"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Value','Text','ComponentSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "5d23af4b9f6dbfb11be59b80a37d359502a9cfe46f3dc97ecc897cd11e2428f7"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Part Number','Text','ComponentSymbol,Footprint,SheetSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "b4d15d9d7c2d481c88183e85d9e8152f0730f61f8e12aafd7878e6578d41800c"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Part Code','Text','ComponentSymbol,Footprint','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "c05b990282c6e4c45b7b9fb24ac9a112a804c5106a0509145da134344fde3e99"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Version','Text','SheetSymbol','{}');",
        "sha256": "e2df934a49782483a6cb7c385440225b7964792953e1c3a34d9e9853d1fe6787"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Page Name','Text','SheetSymbol','{\"sch\":[0,1],\"pcb\":[0,0]}');",
        "sha256": "cbd20fce80c0791603916034945280ec0f9d7ce3791477764b559c0d3e888739"
      },
      {
        "sql": "DELETE FROM \"system_attributes\" WHERE property = 'Name';",
        "sha256": "33c6cd9e9e51bf96c34acdcf9db81e942db0c41c4227fbe5ef6872b51cce17f6"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Global Net Name','Text','NetFlag','{\"sch\":[0,0],\"pcb\":[0,1]}');",
        "sha256": "65ca98aecf06850ea6371a0bd58e96a91d5293db6377d36f8fe7d5c847a072d0"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Datasheet','Text','ComponentSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "0fd0be32ab7ccf7790047183f5118855eee60f17019b67888d0d64b960ac6a44"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Supplier Footprint','Text','ComponentSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "75262f707198c1a2f0217228f6168ed7e72e0bab4f361f5f738816367d4e9e17"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Description','Text','ComponentSymbol','{\"sch\":[0,0],\"pcb\":[0,0]}');",
        "sha256": "da9684d059316ed7dc58830592c758bdc44e0eb180a3178084b7e298234f7923"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Name','Text','ComponentSymbol,BlockSymbol','{\"sch\":[0,1],\"pcb\":[0,0]}');",
        "sha256": "67da9569f85a61ea98d5dceae047799e22a50e006c2ec0a80a9f0874d2608047"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Board Name','Text','SheetSymbol','{\"sch\":[0,1],\"pcb\":[0,0]}');",
        "sha256": "4d05362f9255c42c500dc32bedae9a1f83ce5098f6f2e4cdbaea698fc30d53c6"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('Product Link','Text','ComponentSymbol','{\"pcb\" : [ 0, 0 ],\"sch\" : [ 0, 0 ]}');",
        "sha256": "6da1bddf2327d82d85f3980391cb7091e46da9335e34c83a9c9a7456cc3c5ea9"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('URL','Text','ComponentSymbol','{\"pcb\" : [ 0, 0 ],\"sch\" : [ 0, 0 ]}');",
        "sha256": "408ef9fe6f91d6dab25bf462cb357c8b2893a5fc84943e9bd84f3d17409aa0c1"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Update Time','Text','SheetSymbol','{\"pcb\" : [ 0, 0 ],\"sch\" : [ 0, 1 ]}');",
        "sha256": "2884982af19bc2938214fb0bfcf2c6f044e4fc970af1d43051518ee63f66f6bb"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES('@Create Time','Text','SheetSymbol','{\"pcb\" : [ 0, 0 ],\"sch\" : [ 0, 1 ]}');",
        "sha256": "2f17d8f57a1b874b6da6c68d6d1824440defb7bec120f2a0417dcc9daacceeca"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES ('Link','Text','ComponentSymbol','{ \"pcb\":[0,0], \"sch\":[0,0] }');",
        "sha256": "a112d90b2c6d2ccd2652c0bc7de18dfd250f80b1fd2c049d7c2d504e2c321c71"
      },
      {
        "sql": "INSERT OR REPLACE INTO \"system_attributes\" VALUES ('@Assembly Variant','Text','SheetSymbol','{\"pcb\": [0, 0], \"sch\": [0, 1]}')",
        "sha256": "bd6940211a2fb2102e6e7a14791e79cd9caa8de74788c62d36c5c3f2c3ea3bcb"
      }
    ],
    "dc": [
      {
        "sql": "\n    CREATE TABLE IF NOT EXISTS \"web_cookies\" (\n        \"scheme\" varchar NOT NULL,\n        \"domain\" varchar NOT NULL,\n        \"name\" varchar NOT NULL,\n        \"value\" varchar NOT NULL,\n        \"expire\" real NOT NULL,\n        \"httponly\" integer NOT NULL,\n        primary key (scheme, domain, name)\n    );\n",
        "sha256": "3f84f95131c3c0a26cbe18f1cb6204b608723dd84241f37a39ec32f44df5052d"
      }
    ]
  },
  "transaction": {
    "begin": "begin immediate transaction",
    "commit": "commit transaction",
    "rollback": "rollback transaction"
  },
  "broadcastDeletePrefix": "delete from broadcast_messages   where \n    \"created_at\" < \n    ",
  "cookieDeletePrefix": "delete from web_cookies   where \n    \"expire\" <= \n    ",
  "cookieUpsert": "\n    insert into web_cookies (\"scheme\",\"domain\",\"name\",\"value\",\"expire\",\"httponly\") values (\n        ?,\n        ?,\n        ?,\n        ?,\n        ?,\n        ?) on conflict (\"scheme\",\"domain\",\"name\") do update set \"value\" = \n    ?,\"expire\" = \n    ?,\"httponly\" = \n    ?"
} as const);

export interface CurrentMainStartupConfigSqlMatch {
  readonly schema: "private.current-main-startup-config-sql-match.v1";
  readonly role: CurrentMainStartupConfigRole; readonly site: CurrentMainStartupConfigSqlSite;
  readonly kind: "begin" | "commit" | "rollback" | "script" | "expired-broadcast-delete" | "expired-cookie-delete" | "cookie-upsert";
  readonly scriptIndex: number | null; readonly inlineClockOperand: number | null;
  readonly readonlySql: false; readonly nativeCompletionProven: false; readonly designWriteGrant: false;
}
function bad(): never { throw new Error("MAIN_STARTUP_CONFIG_SQL_DATA"); }
function parameters(input: unknown): readonly unknown[] {
  if (input === null || typeof input !== "object" || types.isProxy(input) || !Array.isArray(input) || Object.getPrototypeOf(input) !== Array.prototype) { return bad(); }
  const length = Object.getOwnPropertyDescriptor(input, "length");
  if (length === undefined || !Object.hasOwn(length, "value") || typeof length.value !== "number" || !Number.isSafeInteger(length.value) || length.value < 0 || length.value > 9 || Reflect.ownKeys(input).length !== length.value + 1) { return bad(); }
  const values: unknown[] = [];
  for (let index = 0; index < length.value; index += 1) {
    const entry = Object.getOwnPropertyDescriptor(input, String(index));
    if (entry === undefined || !Object.hasOwn(entry, "value")) { return bad(); }
    const value: unknown = entry.value;
    if (value !== null && typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" || typeof value === "string" && (value.length > 2_097_152 || !value.isWellFormed()) || typeof value === "number" && (!Number.isFinite(value) || Object.is(value, -0))) { return bad(); }
    values.push(value);
  }
  return values;
}
function inlineClock(sql: string, prefix: string, maximum: number, whole: boolean): number | null {
  if (!sql.startsWith(prefix)) { return null; }
  const literal = sql.slice(prefix.length), value = Number(literal);
  if (literal.length === 0 || literal.length > 32 || !Number.isFinite(value) || Object.is(value, -0) || String(value) !== literal || Math.abs(value) > maximum || whole && !Number.isSafeInteger(value)) { return null; }
  return value;
}
function cookieParameters(values: readonly unknown[]): boolean {
  if (values.length !== 9) { return false; }
  for (let index = 0; index < 4; index += 1) {
    const limit = [32, 2048, 1024, 2_097_152][index], value = values[index];
    if (limit === undefined || typeof value !== "string" || value.length > limit || index < 3 && value.length === 0) { return false; }
  }
  const expiration = values[4], httpOnly = values[5];
  return typeof expiration === "number" && Math.abs(expiration) <= 8_640_000_000_000 && (httpOnly === 0 || httpOnly === 1) &&
    values[6] === values[3] && values[7] === expiration && values[8] === httpOnly;
}
/** Exact string comparison only. The caller owns the genuine role, original
 * DB/yo/statement identities, source invocation and one-use continuation.
 * Inlined Date results are observed operands, never a new clock estimate. */
export function compareCurrentMainStartupConfigSql(role: CurrentMainStartupConfigRole, site: CurrentMainStartupConfigSqlSite,
  sql: unknown, rawParameters: unknown): CurrentMainStartupConfigSqlMatch | null {
  if (role !== "jb" && role !== "dc" || !["run", "prepare", "prepared", "statementRun", "finalize"].includes(site) || typeof sql !== "string" || sql.length === 0 || sql.length > 65_536 || !sql.isWellFormed()) { return bad(); }
  const values = parameters(rawParameters);
  const match = (kind: CurrentMainStartupConfigSqlMatch["kind"], scriptIndex: number | null = null, inlineClockOperand: number | null = null): CurrentMainStartupConfigSqlMatch =>
    Object.freeze({ schema: "private.current-main-startup-config-sql-match.v1", role, site, kind, scriptIndex, inlineClockOperand, readonlySql: false, nativeCompletionProven: false, designWriteGrant: false });
  if (site === "run" && values.length === 0) {
    if (role === "jb") {
      for (const kind of ["begin", "commit", "rollback"] as const) { if (sql === CURRENT_MAIN_STARTUP_CONFIG_SQL.transaction[kind]) { return match(kind); } }
    }
    const scriptIndex = CURRENT_MAIN_STARTUP_CONFIG_SQL.scripts[role].findIndex(script => script.sql === sql);
    if (scriptIndex !== -1) { return match("script", scriptIndex); }
    const operand = role === "jb" ? inlineClock(sql, CURRENT_MAIN_STARTUP_CONFIG_SQL.broadcastDeletePrefix, 8_640_000_003_600_000, true) :
      inlineClock(sql, CURRENT_MAIN_STARTUP_CONFIG_SQL.cookieDeletePrefix, 8_640_000_000_000, false);
    if (operand !== null) { return match(role === "jb" ? "expired-broadcast-delete" : "expired-cookie-delete", null, operand); }
  }
  if (role === "dc" && sql === CURRENT_MAIN_STARTUP_CONFIG_SQL.cookieUpsert &&
    ((site === "prepare" || site === "prepared" || site === "finalize") && values.length === 0 || site === "statementRun" && cookieParameters(values))) { return match("cookie-upsert"); }
  return null;
}
/** Complete pinned app qualification plus individual public source rows. This
 * supplies static evidence only and creates no runtime token or SQL grant. */
export function qualifyCurrentMainStartupConfigSource(input: unknown): void {
  qualifyCurrentFootprintCopyMainBackendSource(input); if (typeof input !== "string") { return bad(); }
  for (const row of Object.values(CURRENT_MAIN_STARTUP_CONFIG_SQL.sourceRows)) {
    const prefix = input.slice(0, row.start), value = input.slice(row.start, row.end);
    if (Buffer.byteLength(value) !== row.bytes || createHash("sha256").update(value).digest("hex") !== row.sha256 || prefix.split("\n").length - 1 !== row.lineNumber || row.start - prefix.lastIndexOf("\n") - 1 !== row.columnNumber) { return bad(); }
  }
  for (const role of ["jb", "dc"] as const) {
    const name = role === "jb" ? "h6" : "KB", row = CURRENT_MAIN_STARTUP_CONFIG_SQL.sourceRows[name];
    const declaration = input.slice(row.start, row.end), prefix = `${name}=\``;
    if (!declaration.startsWith(prefix) || !declaration.endsWith("`")) { return bad(); }
    const chunks = declaration.slice(prefix.length, -1).replaceAll(/^--.*$/gu, "").split(/\r?\n\r?\n/mu).filter(chunk => !/^\s*$/u.test(chunk));
    if (chunks.length !== CURRENT_MAIN_STARTUP_CONFIG_SQL.scripts[role].length || chunks.some((chunk, index) => chunk !== CURRENT_MAIN_STARTUP_CONFIG_SQL.scripts[role][index]?.sql)) { return bad(); }
  }
}
