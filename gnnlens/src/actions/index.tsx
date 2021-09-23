import {MODEL_CHANGE, GRAPH_CHANGE, INIT_MODEL_LIST, EXPLAIN_METHOD_ID_CHANGE,
    DATASET_ID_CHANGE, INIT_DATASET_LIST, INIT_EXPLAIN_LIST, INIT_GRAPH_LIST, FILTERS_CHANGE,
    SELECTED_NODE_ID_LIST_CHANGE, SELECTED_MESSAGE_PASSING_NODE_ID_LIST_CHANGE,
    SHOW_SOURCE_CHANGE, SPECIFIC_NODE_ID_LIST_CHANGE, SELECT_INSPECT_NODE_CHANGE,
    CLEAR_ID_INFO,  PREV_GRAPH_JSON_CHANGE, MATRIX_FILTERS_CHANGE, MATRIX_ROW_FILTERS_CHANGE
    ,INSPECT_CATEGORY_LIST_CHANGE, PSJSON_CHANGE, PSSELECTEDNODES_CHANGE, EXTENDED_MODE_CHANGE, PROJECTIONVIEWSELECTEDNODES_CHANGE,
    PROJECTIONVIEWTOTALNODENUM_CHANGE, PSSETTINGMODAL_VISIBLE_CHANGE, PSDIMENSIONS_CHANGE,
    PROJECTIONVIEWSETTINGMODAL_VISIBLE_CHANGE, GRAPHVIEWSETTINGMODAL_VISIBLE_CHANGE,
    FEATUREMATRIXVIEWSETTINGMODAL_VISIBLE_CHANGE, GRAPHVIEWSTATE_CHANGE, KVALUE_CHANGE} from '../constants';

// Define Change Model Methods
export const changeModel = (model:number | null) =>({
    type: MODEL_CHANGE,
    model: model
})

// Define Change Model Methods
export const changeDataset = (dataset_id:number | null) =>({
    type: DATASET_ID_CHANGE,
    dataset_id: dataset_id
})

// Define Change Model Methods
export const changeExplainMethod = (explain_id:number | null) =>({
    type: EXPLAIN_METHOD_ID_CHANGE,
    explain_id: explain_id
})

export const changeGraph = (graph:number | null) =>({
    type: GRAPH_CHANGE,
    graph: graph
})
export const changeFilters = (filters: any) =>({
    type: FILTERS_CHANGE,
    filters: filters
})
export const changeMatrixFilters = (MatrixFilters: any) =>({
    type: MATRIX_FILTERS_CHANGE,
    matrixFilters: MatrixFilters
})
export const changeMatrixRowFilters = (MatrixRowFilters: any) =>({
    type: MATRIX_ROW_FILTERS_CHANGE,
    matrixRowFilters: MatrixRowFilters
})
export const changeSelectedNodeIdList = (selectedNodeIdList: any) =>({
    type: SELECTED_NODE_ID_LIST_CHANGE,
    selectedNodeIdList: selectedNodeIdList
})
export const changeInspectCategoryList = (inspectCategoryList: any) =>({
    type: INSPECT_CATEGORY_LIST_CHANGE,
    inspectCategoryList: inspectCategoryList
})
export const changeExtendedMode = (extendedMode: number) =>({
    type: EXTENDED_MODE_CHANGE,
    extendedMode: extendedMode
})
export const changePSJson = (PSJson: any) =>({
    type: PSJSON_CHANGE,
    PSJson: PSJson
})
export const changePSSelectedNodes = (PSSelectedNodes:number) =>({
    type: PSSELECTEDNODES_CHANGE,
    PSSelectedNodes: PSSelectedNodes
})
export const changePSSettingsModal_visible = (visible:boolean) =>({
    type: PSSETTINGMODAL_VISIBLE_CHANGE,
    PSSettingsModal_visible: visible
})
export const changeProjectionViewSettingsModal_visible = (visible:boolean) =>({
    type: PROJECTIONVIEWSETTINGMODAL_VISIBLE_CHANGE,
    ProjectionViewSettingsModal_visible: visible
})
export const changeGraphViewSettingsModal_visible = (visible:boolean) =>({
    type: GRAPHVIEWSETTINGMODAL_VISIBLE_CHANGE,
    GraphViewSettingsModal_visible: visible
})
export const changeFeatureMatrixViewSettingsModal_visible = (visible:boolean) =>({
    type: FEATUREMATRIXVIEWSETTINGMODAL_VISIBLE_CHANGE,
    FeatureMatrixViewSettingsModal_visible: visible
})

export const changeGraphViewState = (state_dict:any) =>({
    type: GRAPHVIEWSTATE_CHANGE,
    GraphViewState: state_dict
})

export const changeK_value = (K_value:any) =>({
    type: KVALUE_CHANGE,
    K_value: K_value
})


export const changePSDimensions = (PSDimensions:any[]) =>({
    type: PSDIMENSIONS_CHANGE,
    PSDimensions: PSDimensions
})
export const changeProjectionViewSelectedNodes = (ProjectionViewSelectedNodes:number) =>({
    type: PROJECTIONVIEWSELECTEDNODES_CHANGE,
    ProjectionViewSelectedNodes: ProjectionViewSelectedNodes
})
export const changeProjectionViewTotalNodeNum = (ProjectionViewTotalNodeNum:number) =>({
    type: PROJECTIONVIEWTOTALNODENUM_CHANGE,
    ProjectionViewTotalNodeNum: ProjectionViewTotalNodeNum
})
export const changeMessagePassingSelectedNodeIdList = (selectedMessagePassingNodeIdList: any) =>({
    type: SELECTED_MESSAGE_PASSING_NODE_ID_LIST_CHANGE,
    selectedMessagePassingNodeIdList: selectedMessagePassingNodeIdList
})

export const changeSpecificNodeIdList = (specificNodeIdList: any) =>({
    type: SPECIFIC_NODE_ID_LIST_CHANGE,
    specificNodeIdList: specificNodeIdList
})

export const changeSelectInspectNode = (select_inspect_node:any)=>({
    type: SELECT_INSPECT_NODE_CHANGE,
    select_inspect_node: select_inspect_node
})

export const changeShowSource = (showSource: boolean) =>({
    type: SHOW_SOURCE_CHANGE,
    showSource: showSource
})
export const changePrevGraphJson = (prevGraphJson: any) =>({
    type: PREV_GRAPH_JSON_CHANGE,
    prevGraphJson: prevGraphJson
})

export const clearIdInfo = () =>({
    type: CLEAR_ID_INFO
})

export const initModelList = (modelList:any) =>({
    type: INIT_MODEL_LIST,
    modelList: modelList
})

export const initDatasetList = (datasetList:any) =>({
    type: INIT_DATASET_LIST,
    datasetList: datasetList
})
export const initExplainList = (explainList:any) =>({
    type: INIT_EXPLAIN_LIST,
    explainList: explainList
})
export const initGraphList = (graphList:any) =>({
    type: INIT_GRAPH_LIST,
    graphList: graphList
})


/*import { DECREMENT, INCREMENT } from '../constants';

export interface IINCREMENTAction {
    type: INCREMENT;
}

export interface IDECREMENTAction {
    type: DECREMENT;
}

// 定义 modifyAction 类型，包含 IINCREMENTAction 和 IDECREMENTAction 接口类型
export type ModifyAction = IINCREMENTAction | IDECREMENTAction;


// 增加 state 次数的方法
export const increment = (): IINCREMENTAction => ({
    type: INCREMENT,
})

// 减少 state 次数的方法
export const decrement = (): IDECREMENTAction => ({
    type: DECREMENT
})*/
