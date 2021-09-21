import SelectedNodeList from '../components/DataRuns/ProjectionView/SelectedNodeList';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {changeFilters, changeSelectedNodeIdList, changeShowSource, changePSSelectedNodes, changeProjectionViewSelectedNodes, changeProjectionViewTotalNodeNum} from '../actions';
//import { decrement, increment } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    filters: state.filters,
    refreshnumber: state.refreshnumber,
    showSource: state.showSource,
    select_inspect_node: state.select_inspect_node,
    PCPJson: state.PSJson
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeSelectedNodeIdList:  (selectedNodeIdList:any) => dispatch(changeSelectedNodeIdList(selectedNodeIdList)),
    changeShowSource: (showSource:boolean) => dispatch(changeShowSource(showSource)),
    changePSSelectedNodes: (PSSelectedNodes:number) => dispatch(changePSSelectedNodes(PSSelectedNodes)),
    changeProjectionViewSelectedNodes: (ProjectionViewSelectedNodes:number) => dispatch(changeProjectionViewSelectedNodes(ProjectionViewSelectedNodes)),
    changeProjectionViewTotalNodeNum: (ProjectionViewTotalNodeNum:number) => dispatch(changeProjectionViewTotalNodeNum(ProjectionViewTotalNodeNum))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(SelectedNodeList);
