import * as React from 'react';
import { Select, Row, Col} from 'antd';
import { getDatasetList} from '../../../service/dataService';
const Option = Select.Option;


export interface DataSelectorProps {
    dataset_id : number | null,
    datasetList: any,
    changeDataset: any,
    clearIdInfo:any,
    initDatasetList: any,
}

export interface DataSelectorState {
    //DataSelectorValue : number
}

export default class DataSelector extends React.Component<DataSelectorProps, DataSelectorState> {
    constructor(props: DataSelectorProps) {
        super(props);
        this.onDatasetSelectorChange = this.onDatasetSelectorChange.bind(this);
        this.state = {
            //DataSelectorValue: 1
            // datarunStatus: IDatarunStatusTypes.PENDING
        };
    }
    componentDidMount(){
        //this.initModelList();
        this.initDatasetList();
    }
    public async initDatasetList(){
        const datasetList_package = await getDatasetList();
        //console.log(datasetList_package);
        
        if(datasetList_package["success"] === true){
            this.props.initDatasetList(datasetList_package["datasets"]);
        }
        
    }

    public onDatasetSelectorChange(value: number) {
        this.props.changeDataset(value);
        
    }

    public render() {
        // 230 px 
        let disabledDatasetSelector = this.props.datasetList.length <= 0;
        return (
                <Row>
                    <Col span={4}>
                        Datasets:&nbsp;
                        </Col>
                        <Col span={20}>

                        <Select
                            placeholder="Select a dataset"
                            value={this.props.dataset_id  || undefined}
                            style={{ width: '100%' }}
                            onChange={this.onDatasetSelectorChange}
                            disabled={disabledDatasetSelector}
                        >
                            {this.props.datasetList.map((d:any)=>(
                                <Option value={d.id} key={d.id}>
                                    {d.name}
                                </Option>
                            ))}
                        </Select>
                        </Col>
                </Row>
            )
        
    }
}
