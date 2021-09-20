import ProjectionViewNodeStatistic from '../components/DataRuns/ProjectionView/ProjectionViewNodeStatistic'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { StoreState } from '../types';

const mapStateToProps = (state: StoreState) => ({
    ProjectionViewSelectedNodes: state.ProjectionViewSelectedNodes,
    ProjectionViewTotalNodeNum: state.ProjectionViewTotalNodeNum
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(ProjectionViewNodeStatistic);



