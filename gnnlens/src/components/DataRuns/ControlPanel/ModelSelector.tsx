import * as React from 'react';
import { Select, Row} from 'antd';
import { getDatasetList} from '../../../service/dataService';
const Option = Select.Option;


export interface ModelSelectorProps {
    selected_models_list : any,
    models_list: any,
    changeSelectedModels: any
}

export interface ModelSelectorState {
    //DataSelectorValue : number
}

export default class ModelSelector extends React.Component<ModelSelectorProps, ModelSelectorState> {
    constructor(props: ModelSelectorProps) {
        super(props);
        this.onModelSelectorChange = this.onModelSelectorChange.bind(this);
        this.state = {
            //DataSelectorValue: 1
            // datarunStatus: IDatarunStatusTypes.PENDING
        };
    }
    componentDidMount(){
    }
    

    public onModelSelectorChange(value: any) {
        //console.log("Model selector", value);
        if(value.length <= 0 || value.length >= 4){

        }else{
            this.props.changeSelectedModels(value);

        }

        //this.props.changeDataset(value);
        //this.props.clearIdInfo();
    }

    public render() {
        
        let disabledModelsSelector = false;
        if(!this.props.selected_models_list || this.props.models_list.length <= 0){
            disabledModelsSelector = true;
        }
        //if(!disabledDatasetSelector && !this.props.dataset_id){
        //    this.onDatasetSelectorChange(7);
        //}
        let {models_list} = this.props;
        let nlabel_options_indexed = [];
        for(let i = 0; i< models_list.length; i++){
            let nlabel_object:any = {
                "name":  models_list[i],
                "id": i
            }
            nlabel_options_indexed.push(nlabel_object);
        }
        return (
                <Row>
                        Models:&nbsp;
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select models"
                            style={{ width: '230px' }}
                            onChange={this.onModelSelectorChange}
                            disabled={disabledModelsSelector}
                            value={this.props.selected_models_list}
                            defaultValue={[]}
                        >
                            {nlabel_options_indexed.map((d:any)=>(
                                <Option value={d.name} key={d.id}>{d.name}</Option>
                            ))}
                        </Select>
                </Row>
            )
        
    }
}
