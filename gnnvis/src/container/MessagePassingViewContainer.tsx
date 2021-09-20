import MessagePassingView from '../components/DataRuns/MessagePassingView/'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';


import { changeMessagePassingSelectedNodeIdList, changeShowSource, changeSelectInspectNode } from '../actions';
import { StoreState } from '../types';


// 将 reducer 中的状态插入到组件的 props 中
const mapStateToProps = (state: StoreState) => ({
    showSource: state.showSource,
    select_inspect_node : state.select_inspect_node
})

// 将 对应action 插入到组件的 props 中
const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeMessagePassingNodeIdList:  (selectedMessagePassingNodeIdList:any) => dispatch(changeMessagePassingSelectedNodeIdList(selectedMessagePassingNodeIdList)),
    changeShowSource: (showSource:boolean) => dispatch(changeShowSource(showSource)),
    changeSelectInspectNode : (select_inspect_node:number) => dispatch(changeSelectInspectNode(select_inspect_node))
})

// 使用 connect 高阶组件对 Counter 进行包裹
export default connect(mapStateToProps, mapDispatchToProps)(MessagePassingView);



