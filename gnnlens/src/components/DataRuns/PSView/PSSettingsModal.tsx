import * as React from "react";
import { Modal, Select, Button } from 'antd';
import { PSDIMENSIONS_CHANGE } from "../../../constants";
export interface IProps {
    PSSettingModal_visible: boolean,
    PSSettingModal_visible_setting: any,
    changePSDimensions:any,
    PSDimensions:any,
    CandidatePSDimensions:any,
    DefaultPSDimensions:any
}
export interface IState {
}
export default class PSSettingsModal extends React.Component<IProps, IState>{
    constructor(props:IProps) {
        super(props);

        this.state = {
        }
        //this.resize.bind(this);
        // Flow:
        // 1. Constructor
        // 2. componentWillMount()
        // 3. render()
        // 4. componentDidMount()
        // If props update:
        // 4.1 componentWillReceiveProps(nextProps : IProps), then goto 5.
        // If States update
        // 5. shouldComponentUpdate() if return false, then no rerendering.
        // 6. if True, then componentWillUpdate
        // 7. render()
        // 8. componentDidUpdate
        // If Unmount, then componentWillUnmount()
    }
    handleOk = (e:any) => {
        console.log(e);
        this.props.PSSettingModal_visible_setting(false);
      };
    
    handleCancel = (e:any) => {
        console.log(e);
        this.props.PSSettingModal_visible_setting(false);
      };
    handleChange = (value:any) =>{
        if(value.length < 2){
            console.log("Modal Warning: the number of dimensions cannot be less than 2.");
        }else{
            this.props.changePSDimensions(value);

        }
        //console.log("selected", value);
    }
    public render() {
        const { Option } = Select;
        const children = [];
        let CandidatePSDimensions = this.props.CandidatePSDimensions;
        for (let i = 0; i < CandidatePSDimensions.length; i++) {
            children.push(<Option key={CandidatePSDimensions[i]}>{CandidatePSDimensions[i]}</Option>);
        }

        if(this.props.PSDimensions.length <=0){
            this.props.changePSDimensions(this.props.DefaultPSDimensions);
        }
        console.log("Parallel Sets View Settings Modal, ", this.props.PSSettingModal_visible);
        return  (      
        <Modal
            title="Parallel Sets View Settings"
            visible={this.props.PSSettingModal_visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={[
                <Button key="OK" type="primary" onClick={this.handleOk}>
                  OK
                </Button>
              ]}
        >
                Dimensions Selection:
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Please select dimensions."
                    value={this.props.PSDimensions}
                    onChange={this.handleChange}
                >
                    {children}
                </Select>
        </Modal>)
    }
}

