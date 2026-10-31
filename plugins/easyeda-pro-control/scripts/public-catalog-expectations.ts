/** Independent verification contract. Keep these literal method/tool/action
 * expectations separate from runtime descriptors and generated coverage. */
export const EXPECTED_NETWORK_CATALOG_ROUTES = [
  ["eda.lib_Footprint.get", "easyeda_control_catalog_footprint", "fixed-vendor-system-catalog-footprint"],
  ["eda.lib_Footprint.search", "easyeda_control_catalog_components", "search-footprints"],
  ["eda.lib_Symbol.search", "easyeda_control_catalog_components", "search-symbols"],
  ["eda.lib_Device.search", "easyeda_control_catalog_components", "search-devices"],
  ["eda.lib_Symbol.get", "easyeda_control_catalog_components", "get-symbol"],
  ["eda.lib_Device.get", "easyeda_control_catalog_components", "get-device"],
  ["eda.lib_Symbol.searchByProperties", "easyeda_control_catalog_components", "search-symbols-by-name"],
  ["eda.lib_Footprint.searchByProperties", "easyeda_control_catalog_components", "search-footprints-by-name"],
  ["eda.lib_Device.getByLcscIds", "easyeda_control_catalog_components", "get-devices-by-lcsc-ids"],
  ["eda.lib_Classification.getAllClassificationTree", "easyeda_control_catalog_components", "get-classification-tree"],
  ["eda.lib_Classification.getIndexByName", "easyeda_control_catalog_components", "get-classification-index-by-name"],
  ["eda.lib_Classification.getNameByUuid", "easyeda_control_catalog_components", "get-classification-name-by-uuid"],
  ["eda.lib_Classification.getNameByIndex", "easyeda_control_catalog_components", "get-classification-name-by-index"],
  ["eda.lib_3DModel.search", "easyeda_control_catalog_components", "search-3d-models"],
  ["eda.lib_PanelLibrary.search", "easyeda_control_catalog_components", "search-panel-libraries"],
  ["eda.lib_PanelLibrary.get", "easyeda_control_catalog_components", "get-panel-library"],
] as const;

export const EXPECTED_COMPONENT_CATALOG_ACTIONS = EXPECTED_NETWORK_CATALOG_ROUTES
  .filter(([, tool]) => tool === "easyeda_control_catalog_components").map((route) => route[2]).toSorted();
