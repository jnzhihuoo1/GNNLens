import PSViewNodeStatistic from '../components/DataRuns/PSView/PSViewNodeStatistic'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { StoreState } from '../types';
import PSSettingsModal from '../components/DataRuns/PSView/PSSettingsModal';
import { changePSSettingsModal_visible, changePSDimensions, changeK_value } from '../actions';

const mapStateToProps = (state: StoreState) => ({
    PSSettingModal_visible: state.PSSettingsModal_visible,
    PSDimensions: state.PSDimensions,
    K_value:state.K_value
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
    PSSettingModal_visible_setting: (visible:boolean) => dispatch(changePSSettingsModal_visible(visible)),
    changePSDimensions: (PSDimensions:any) => dispatch(changePSDimensions(PSDimensions)),
    changeK_value: (K_value:any) => dispatch(changeK_value(K_value))
})

export default connect(mapStateToProps, mapDispatchToProps)(PSSettingsModal);



