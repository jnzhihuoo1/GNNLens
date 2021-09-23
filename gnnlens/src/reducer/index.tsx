import { MODEL_CHANGE, GRAPH_CHANGE, INIT_MODEL_LIST, DATASET_ID_CHANGE,
  EXPLAIN_METHOD_ID_CHANGE, INIT_DATASET_LIST, INIT_EXPLAIN_LIST, 
  INIT_GRAPH_LIST, FILTERS_CHANGE, SELECTED_NODE_ID_LIST_CHANGE,
  SELECTED_MESSAGE_PASSING_NODE_ID_LIST_CHANGE, SHOW_SOURCE_CHANGE,
SPECIFIC_NODE_ID_LIST_CHANGE, SELECT_INSPECT_NODE_CHANGE,CLEAR_ID_INFO, PREV_GRAPH_JSON_CHANGE,
MATRIX_FILTERS_CHANGE,MATRIX_ROW_FILTERS_CHANGE, INSPECT_CATEGORY_LIST_CHANGE, PSJSON_CHANGE,PSSELECTEDNODES_CHANGE, EXTENDED_MODE_CHANGE, 
PROJECTIONVIEWSELECTEDNODES_CHANGE,PROJECTIONVIEWTOTALNODENUM_CHANGE, 
PSSETTINGMODAL_VISIBLE_CHANGE,PSDIMENSIONS_CHANGE, GRAPHVIEWSETTINGMODAL_VISIBLE_CHANGE, 
FEATUREMATRIXVIEWSETTINGMODAL_VISIBLE_CHANGE, GRAPHVIEWSTATE_CHANGE, KVALUE_CHANGE} from '../constants';
import {StoreState} from '../types';
import {getDefaultInspectCategoryOptions} from '../helper';
const initial_state : StoreState = {
    model : null,
    graph : null,
    dataset_id : null,
    explain_id:null,
    refreshnumber: 0,
    showSource: false,
    modelList : [],
    datasetList: [],
    explainList: [],
    graphList: [],
    filters: {},
    selectedNodeIdList: [],
    selectedMessagePassingNodeIdList: [],
    specificNodeIdList: [],
    select_inspect_node : 0,
    prevGraphJson: null,
    matrixFilters: {
      refreshnumber : 0
    },
    matrixRowFilters:{
      refreshnumber : 0
    },
    InspectCategoryList: getDefaultInspectCategoryOptions(),
    PSJson: {},
    PSSelectedNodes:0,
    extendedMode:1,
    ProjectionViewSelectedNodes:0,
    ProjectionViewTotalNodeNum:0,
    PSSettingsModal_visible:false,
    PSDimensions:[],
    ProjectionViewSettingsModal_visible:false,
    GraphViewSettingsModal_visible:false,
    FeatureMatrixViewSettingsModal_visible:false,
    GraphViewState:{
      DisplayUnfocusedNodes:false,
      DisplayOverview:true
    },
    K_value:5
}
// 处理并返回 state 
export default (state = initial_state, action:any): StoreState => {
   
    switch (action.type) {
      case MODEL_CHANGE:
        return {
          ...state,
          model : action.model
        };
      case GRAPH_CHANGE:
        return {
          ...state,
          graph : action.graph
        };
      case INIT_MODEL_LIST:
        return {
          ...state,
          modelList: action.modelList
        };
      case DATASET_ID_CHANGE:
        return {
          ...state,
          dataset_id: action.dataset_id,
        };
      case EXPLAIN_METHOD_ID_CHANGE:
        return {
          ...state,
          explain_id: action.explain_id
        };
      case INIT_DATASET_LIST:
        return {
          ...state,
          datasetList: action.datasetList
        };
      case INIT_EXPLAIN_LIST:
        return {
          ...state,
          explainList: action.explainList
        };
      case INIT_GRAPH_LIST:
          return {
            ...state,
            graphList: action.graphList
          };
      case FILTERS_CHANGE:
        
         //console.log("Filters Change!", action.filters);
          return {
            ...state,
            refreshnumber: state.refreshnumber + 1,
            filters: action.filters
          }
      case SELECTED_NODE_ID_LIST_CHANGE:
        //console.log("selectedNodeIdList Store State Change",action.selectedNodeIdList);
        return {
          ...state,
          selectedNodeIdList: action.selectedNodeIdList
        }
      case SELECTED_MESSAGE_PASSING_NODE_ID_LIST_CHANGE:
        return {
          ...state,
          selectedMessagePassingNodeIdList: action.selectedMessagePassingNodeIdList
        }
      case SHOW_SOURCE_CHANGE:
        return {
          ...state,
          showSource: action.showSource
        }
      case SPECIFIC_NODE_ID_LIST_CHANGE:
        //console.log("SpecificNodeIdListChange",  action.specificNodeIdList);
        return {
          ...state,
          specificNodeIdList: action.specificNodeIdList
        }
      case SELECT_INSPECT_NODE_CHANGE:
        //console.log("Select inspect node change", action.select_inspect_node);
        return {
          ...state,
          select_inspect_node: action.select_inspect_node
        }
      case CLEAR_ID_INFO:
        return {
          ...state,
          filters: {},
          selectedNodeIdList: [],
          selectedMessagePassingNodeIdList: [],
          specificNodeIdList: [],
          select_inspect_node : 0
        }
      case PREV_GRAPH_JSON_CHANGE:
        return {
          ...state,
          prevGraphJson: action.prevGraphJson
        }
      case MATRIX_FILTERS_CHANGE:
        return {
          ...state,
          matrixFilters: action.matrixFilters
        }
      case MATRIX_ROW_FILTERS_CHANGE:
        //console.log("rowmatrix",action.matrixRowFilters);
        return {
          ...state,
          matrixRowFilters: action.matrixRowFilters
        }
      case INSPECT_CATEGORY_LIST_CHANGE:
        console.log("CategoryList", action.inspectCategoryList);
        return {
          ...state,
          InspectCategoryList: action.inspectCategoryList
        }
      case PSJSON_CHANGE:
        return {
          ...state,
          PSJson: action.PSJson
        }
      case PSSELECTEDNODES_CHANGE:
        return {
          ...state,
          PSSelectedNodes: action.PSSelectedNodes
        }
      case EXTENDED_MODE_CHANGE:
        return {
          ...state,
          extendedMode: action.extendedMode
        }
      case PROJECTIONVIEWSELECTEDNODES_CHANGE:
        return {
          ...state,
          ProjectionViewSelectedNodes: action.ProjectionViewSelectedNodes
        }
      case PROJECTIONVIEWTOTALNODENUM_CHANGE:
        return {
          ...state,
          ProjectionViewTotalNodeNum: action.ProjectionViewTotalNodeNum
        }
      case PSSETTINGMODAL_VISIBLE_CHANGE:
        return {
          ...state,
          PSSettingsModal_visible: action.PSSettingsModal_visible
        }
      case PSDIMENSIONS_CHANGE:
        return {
          ...state,
          PSDimensions: action.PSDimensions
        }
      case PROJECTIONVIEWSELECTEDNODES_CHANGE:
        return {
          ...state,
          ProjectionViewSettingsModal_visible: action.ProjectionViewSettingsModal_visible
        }
      case GRAPHVIEWSETTINGMODAL_VISIBLE_CHANGE:
        return {
          ...state,
          GraphViewSettingsModal_visible: action.GraphViewSettingsModal_visible
        }
      case FEATUREMATRIXVIEWSETTINGMODAL_VISIBLE_CHANGE:
        return {
          ...state,
          FeatureMatrixViewSettingsModal_visible: action.FeatureMatrixViewSettingsModal_visible
        }
      case GRAPHVIEWSTATE_CHANGE:
        return {
          ...state,
          GraphViewState: action.GraphViewState
        }
      case KVALUE_CHANGE:
        return {
          ...state,
          K_value: action.K_value
        }
      default:
        return state
    }
}


//import { DECREMENT, INCREMENT } from '../constants';

