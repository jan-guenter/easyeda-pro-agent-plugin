/** UI 3.2.149.43637efe createBlankTab inserts this hidden project-attribute
 * placeholder. Its public split-screen tree omits tab 0; raw tabBar lists do not.
 * The caller must enforce a singleton and still prove the active project/tab.
 */
export const NATIVE_PROJECT_PLACEHOLDER_PREDICATE = `const isNativeProjectPlaceholder=tab=>!!tab&&typeof tab==='object'&&!Array.isArray(tab)&&
tab.tabId==='0'&&tab.isAbleDelete===false&&tab.isDisplayNone===true&&tab.draggable===false&&tab.group==='start_blank'&&
(tab.documentType===undefined||tab.documentType===0)&&tab.parentProjectUuid===undefined&&tab.parentLibraryUuid===undefined&&
!!tab.data&&typeof tab.data==='object'&&!Array.isArray(tab.data)&&tab.data.doctype===0&&tab.data.pid===undefined&&tab.data.owner===undefined&&
(Object.hasOwn(tab,'isUnSaved')?tab.isUnSaved===false:tab.isUnSaved===undefined);`;
