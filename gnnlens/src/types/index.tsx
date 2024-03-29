// 定义 State 结构类型
export type StoreState = {
    model : number | null,
    graph : number | null,
    dataset_id : number | null,
    explain_id : number | null,
    refreshnumber: number,
    modelList : any[],
    datasetList : any[],
    explainList : any[],
    graphList: any[],
    filters: any,
    selectedNodeIdList: any[],
    selectedMessagePassingNodeIdList: any[],
    selected_models_list: any[],
    models_list:any[],
    specificNodeIdList: any[],

    select_inspect_node : number
    showSource: boolean,
    prevGraphJson: any,
    matrixFilters: any,
    matrixRowFilters:any,
    InspectCategoryList: any[],
    PSJson:any,
    PSSelectedNodes:number,
    extendedMode:any,
    ProjectionViewSelectedNodes:number,
    ProjectionViewTotalNodeNum:number,
    PSSettingsModal_visible:boolean,
    PSDimensions:any[],
    ProjectionViewSettingsModal_visible:boolean,
    GraphViewSettingsModal_visible:boolean,
    FeatureMatrixViewSettingsModal_visible:boolean,
    GraphViewState:any,
    K_value:any,
    loading_dataset:boolean
};