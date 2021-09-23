import * as React from "react";
import { Modal, Select, Button, Row, Col, Slider, InputNumber } from 'antd';
import { PSDIMENSIONS_CHANGE } from "../../../constants";
export interface IProps {
    PSSettingModal_visible: boolean,
    PSSettingModal_visible_setting: any,
    changePSDimensions:any,
    PSDimensions:any,
    CandidatePSDimensions:any,
    DefaultPSDimensions:any,
    K_value:any,
    changeK_value:any
}
export interface IState {
}
export default class PSSettingsModal extends React.Component<IProps, IState>{
    public min_K_value = 1;
    public max_K_value = 5;
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
    handleKvalueChange = (value:any) =>{
        if(value>=this.min_K_value && value <= this.max_K_value){
            this.props.changeK_value(value);
        }else if(value < this.min_K_value){
            this.props.changeK_value(this.min_K_value);
        }else if(value > this.max_K_value){
            this.props.changeK_value(this.max_K_value);
        }
    }
    public render() {
        const { Option } = Select;
        const children = [];
        let min_K_value = this.min_K_value;
        let max_K_value = this.max_K_value;
        let {K_value} = this.props;
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
                {/*K value:
                <Row>
                    <Col span={18}>
                    <Slider
                        min={min_K_value}
                        max={max_K_value}
                        onChange={this.handleKvalueChange}
                        value={typeof K_value === 'number' ? K_value : 0}
                    />
                    </Col>
                    <Col span={4}>
                    <InputNumber
                        min={min_K_value}
                        max={max_K_value}
                        style={{ margin: '0 16px' }}
                        value={K_value}
                        onChange={this.handleKvalueChange}
                    />
                    </Col>
                </Row>*/}
        </Modal>)
    }
}

