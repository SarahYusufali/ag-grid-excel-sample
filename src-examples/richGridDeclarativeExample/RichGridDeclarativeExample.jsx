import React, {Component} from "react";
import {AgGridColumn, AgGridReact} from "@ag-grid-community/react";
import RowDataFactory from "./RowDataFactory";
import DateComponent from "./DateComponent.jsx";
import SkillsCellRenderer from './SkillsCellRenderer.jsx';
import NameCellEditor from './NameCellEditor.jsx';
import ProficiencyCellRenderer from './ProficiencyCellRenderer.jsx';
import RefData from './RefData';
import SkillsFilter from './SkillsFilter.jsx';
import ProficiencyFilter from './ProficiencyFilter.jsx';
import HeaderGroupComponent from './HeaderGroupComponent.jsx';
import SortableHeaderComponent from './SortableHeaderComponent.jsx';
import XLSX from 'xlsx'

import "./RichGridDeclarativeExample.css";
// for enterprise features
import {AllModules} from "@ag-grid-enterprise/all-modules";

// for community features
// import {AllCommunityModules} from "@ag-grid-community/all-modules";

export default class RichGridDeclarativeExample extends Component {
    constructor(props) {
        super(props);

        this.state = {
            quickFilterText: null,
            sideBar: false,
            rowData: [],
            columnDefs:[
                { field: "athlete", minWidth: 180 },
                { field: "age" },
                { field: "country", minWidth: 150 },
                { field: "year" },
                { field: "date", minWidth: 130 },
                { field: "sport", minWidth: 100 },
                { field: "gold" },
                { field: "silver" },
                { field: "bronze" },
                { field: "total" }
            ],
            rowCount: null,
            icons: {
                columnRemoveFromGroup: '<i class="fa fa-times"/>',
                filter: '<i class="fa fa-filter"/>',
                sortAscending: '<i class="fa fa-long-arrow-alt-down"/>',
                sortDescending: '<i class="fa fa-long-arrow-alt-up"/>',
                groupExpanded: '<i class="far fa-minus-square"/>',
                groupContracted: '<i class="far fa-plus-square"/>'
            }
        };
    }

    componentDidMount(){
        fetch('https://www.ag-grid.com/example-assets/olympic-data.xlsx')
        .then(res => res.blob())
        .then(blob => blob.arrayBuffer())
        .then(excelArrayBuffer => {
                const workbook = XLSX.read(excelArrayBuffer, {
                    type: 'array'
                 });
                 const ws = workbook.Sheets[workbook.SheetNames[0]];
                 this.setState({rowData: XLSX.utils.sheet_to_json(ws)});
            })
            .catch(e =>{
                console.log(e)
            })
    }

    onGridReady = (params) => {
        this.api = params.api;
        this.columnApi = params.columnApi;
        this.api.sizeColumnsToFit();
        this.calculateRowCount();
        console.log('here')
    };

    onCellClicked = (event) => {
        console.log('onCellClicked: ' + event.data.name + ', col ' + event.colIndex);
    };

    onRowSelected = (event) => {
        console.log('onRowSelected: ' + event.node.data.name);
    };

    /* Demo related methods */
    onToggleSidebar = (event) => {
        this.setState({sideBar: event.target.checked});
    };

    deselectAll() {
        this.api.deselectAll();
    }

    onQuickFilterText = (event) => {
        this.setState({quickFilterText: event.target.value});
    };

    onRefreshData = () => {
        this.setState({
            rowData: new RowDataFactory().createRowData()
        });
    };

    invokeSkillsFilterMethod = () => {
        this.api.getFilterInstance('skills', (instance) => {
            let componentInstance = instance.getFrameworkComponentInstance();
            componentInstance.helloFromSkillsFilter();
        });
    };

    dobFilter = () => {
        this.api.getFilterInstance('dob', (dateFilterComponent) => {
            dateFilterComponent.setModel({
                type: 'equals',
                dateFrom: '2000-01-01'
            });

            // as the date filter is a React component, and its using setState internally, we need
            // to allow time for the state to be set (as setState is an async operation)
            // simply wait for the next tick
            setTimeout(() => {
                this.api.onFilterChanged();
            });
        });
    };

    calculateRowCount = () => {
        if (this.api && this.state.rowData) {
            const model = this.api.getModel();
            const totalRows = this.state.rowData.length;
            const processedRows = model.getRowCount();
            this.setState({
                rowCount: processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString()
            });
        }
    };

    static countryCellRenderer(params) {
        if (params.value) {
            return `<img border='0' width='15' height='10' style='margin-bottom: 2px' src='http://flags.fmcdn.net/data/flags/mini/${RefData.COUNTRY_CODES[params.value]}.png'> ${params.value}`;
        } else {
            return null;
        }
    }

    static dateCellRenderer(params) {
        return RichGridDeclarativeExample.pad(params.value.getDate(), 2) + '/' +
            RichGridDeclarativeExample.pad(params.value.getMonth() + 1, 2) + '/' +
            params.value.getFullYear();
    }

    static pad(num, totalStringSize) {
        let asString = num + "";
        while (asString.length < totalStringSize) asString = "0" + asString;
        return asString;
    }

    createDatasource() {
        /*
        const loadExcelResp = fetch('http://localhost/olympic-data.xlsx');
        const loadExcelRespBlob = loadExcelResp.blob()
        const excelAB = excelBLOB.arrayBuffer()
        const workbook = XLSX.read(exceptAB,"array");
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        */
        return {
            // called by the grid when more rows are required
            getRows: params => {
    
                // get data for request from server
                const response = server.getData(params.request);
    
                if (response.success) {
                    // supply rows for requested block to grid
                    params.success({
                        rowData: response.rows
                    });
                } else {
                    // inform grid request failed
                    params.fail();
                }
            }
        };
    }

    render() {
        return (
            <div style={{width: '100%'}}>
                <h1>Rich Grid with Declarative Markup Example</h1>
                <div style={{display: "inline-block", width: "100%"}}>
                    <div style={{float: "left"}}>
                        <b>Employees Skills and Contact Details: </b>{this.state.rowCount}
                    </div>
                </div>
                <div style={{marginTop: 10}}>
                    <div>
                        <span>
                            Grid API:
                            <button onClick={() => {
                                this.api.selectAll();
                            }} className="btn btn-primary">Select All</button>
                            <button onClick={() => {
                                this.api.deselectAll();
                            }} className="btn btn-primary">Clear Selection</button>
                        </span>
                        <span style={{float: "right"}}>
                            Column API:
                            <button onClick={() => {
                                this.columnApi.setColumnVisible('country', false);
                            }} className="btn btn-primary">Hide Country Column</button>
                            <button onClick={() => {
                                this.columnApi.setColumnVisible('country', true);
                            }} className="btn btn-primary">Show Country Column</button>
                        </span>
                    </div>
                    <div style={{display: "inline-block", width: "100%", marginTop: 10, marginBottom: 10}}>
                        <div style={{float: "left"}}>
                            <button onClick={this.onRefreshData} className="btn btn-primary">Refresh Data</button>
                        </div>
                        <div style={{float: "right"}}>
                            Filter API:
                            <button onClick={this.invokeSkillsFilterMethod}
                                    className="btn btn-primary">Invoke Skills Filter Method
                            </button>
                            <button onClick={this.dobFilter} className="btn btn-primary">DOB equals to 01/01/2000
                            </button>
                        </div>
                    </div>
                    <div style={{display: "inline-block", width: "100%", marginTop: 10, marginBottom: 10}}>
                        <div style={{float: "left"}}>
                            <label htmlFor="sideBarToggle">Show Side Bar&nbsp;</label>
                            <input type="checkbox" id="sideBarToggle" onChange={this.onToggleSidebar}
                                   style={{marginRight: 5}}/>
                        </div>
                        <div style={{float: "right", marginLeft: 20}}>
                            <label htmlFor="quickFilter">Quick Filter:&nbsp;</label>
                            <input type="text" id="quickFilter" onChange={this.onQuickFilterText}
                                   placeholder="Type text to filter..."/>
                        </div>
                    </div>
                    <div style={{height: 650, width: '100%'}} className="ag-theme-alpine">
                        <AgGridReact
                            // listening for events
                            onGridReady={this.onGridReady}
                            onRowSelected={this.onRowSelected}
                            onCellClicked={this.onCellClicked}
                            onModelUpdated={this.calculateRowCount}

                            // binding to simple properties
                            sideBar={this.state.sideBar}
                            quickFilterText={this.state.quickFilterText}

                            // binding to an object property
                            icons={this.state.icons}

                            columnDefs={this.state.columnDefs}
                            // binding to array properties
                            rowData={this.state.rowData}

                            // register all modules (row model, csv/excel, row grouping etc)
                            modules={AllModules}

                            // no binding, just providing hard coded strings for the properties
                            // boolean properties will default to true if provided (ie suppressRowClickSelection => suppressRowClickSelection="true")
                            suppressRowClickSelection
                            rowSelection="multiple"
                            groupHeaders

                            // setting grid wide date component
                            frameworkComponents={{
                                agDateInput: DateComponent
                            }}
                            // setting default column properties
                            defaultColDef={{
                                resizable: true,
                                sortable: true,
                                filter: true,
                                headerComponentFramework: SortableHeaderComponent,
                                headerComponentParams: {
                                    menuIcon: 'fa-bars'
                                }
                            }}
                            
                            >
                           
                        </AgGridReact>
                    </div>
                </div>
            </div>
        );
    }
}
