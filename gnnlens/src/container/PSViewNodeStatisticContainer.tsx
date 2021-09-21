import PSViewNodeStatistic from '../components/DataRuns/PSView/PSViewNodeStatistic'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { StoreState } from '../types';

const mapStateToProps = (state: StoreState) => ({
    PSSelectedNodes: state.PSSelectedNodes
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(PSViewNodeStatistic);



