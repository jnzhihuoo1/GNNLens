import * as React from 'react';
import {Tabs, Table, Row,  Radio, Col, Slider, InputNumber} from 'antd';
import DataSelectorContainer from '../../../container/DataSelectorContainer';
import ModelSelectorContainer from '../../../container/ModelSelectorContainer';
import ModelSelector from './ModelSelector';
//const TabPane = Tabs.TabPane
//const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const RadioPlainOptions = ['All', 'Training', 'Validation', 'Test'];
const plainOptions = ['Train', 'Valid', 'Test','Others'];
const defaultCheckedList = ['Train', 'Valid', 'Test', 'Others'];
export interface ControlPanelProps {
    InspectCategoryList : any,
    onChangeInspectCategoryList : any,
    dataset_id: number | null,
    K_value:any,
    changeK_value:any
}

export interface ControlPanelState {}

export default class ControlPanel extends React.Component<ControlPanelProps, ControlPanelState> {
    public min_K_value = 1;
    public max_K_value = 5;
    constructor(props: ControlPanelProps) {
        super(props);
        this.onChangeRadioCategory = this.onChangeRadioCategory.bind(this);
        //this.onRowClick = this.onRowClick.bind(this);
        this.state = {
        };
    }
    public transformCategoryList(categoryList:any){
        if(categoryList.length === 4){
            return RadioPlainOptions[0]; // All
        }else if(categoryList.length === 1){
            let category = categoryList[0];
            if(category === 'Train'){
                return RadioPlainOptions[1]; // Training
            }else if(category === 'Valid'){
                return RadioPlainOptions[2]; // Validation
            }else if(category === 'Test'){
                return RadioPlainOptions[3]; // Test
            }
        }
        console.log("Some errors occur in categoryList");
        return 'All'; // If others
    }
    public onChangeRadioCategory(e:any){
        let selectedValue = e.target.value;
        let options:any [] = [];
        if(selectedValue === RadioPlainOptions[0]){
            // All
            options = plainOptions;
        }else if(selectedValue === RadioPlainOptions[1]){
            // Training
            options = [plainOptions[0]];
        }else if(selectedValue === RadioPlainOptions[2]){
            // Validation
            options = [plainOptions[1]];
        }else if(selectedValue === RadioPlainOptions[3]){
            // Test
            options = [plainOptions[2]];
        }else{
            console.log("Some errors occur in onChangeRadioCategory selectedValue");
            options = plainOptions;
        }
        this.props.onChangeInspectCategoryList(options);
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
        let radio_value = this.transformCategoryList(this.props.InspectCategoryList);
        let min_K_value = this.min_K_value;
        let max_K_value = this.max_K_value;
        let {K_value} = this.props;
        return (
            <div>
            <div className="ViewTitle">Control Panel</div>
            <div className="ViewBox">
                    <Row>
                        <DataSelectorContainer />
                    </Row>
                    {(this.props.dataset_id && this.props.dataset_id>=0)?
                    <Row>
                        <ModelSelectorContainer />
                    </Row>:(<div />)
                    }
                    {(this.props.dataset_id && this.props.dataset_id>=0)?<Row>
                        Inspect category:&nbsp;&nbsp;
                        <RadioGroup
                            value={radio_value}
                            onChange={this.onChangeRadioCategory}
                        >
                            {RadioPlainOptions.map((d:any,index:number)=>{
                                return <Radio key={d} value={d}>{d}</Radio>
                                
                            })}
                        </RadioGroup>
                        
                    </Row>:(<div />)
                    }
                    {(this.props.dataset_id && this.props.dataset_id>=0)?<Row>
                        <Row>K value:</Row>
                    
                <Row>
                    <Col span={16}>
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
                </Row>
                </Row>:(<div />)
                    }
                    
            </div>
            </div>
            
        );
    }
}
