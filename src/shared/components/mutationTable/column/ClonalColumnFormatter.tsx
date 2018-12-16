import * as React from 'react';
import DefaultTooltip from 'shared/components/defaultTooltip/DefaultTooltip';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "shared/lib/getCanonicalMutationType";
import {floatValueIsNA} from "shared/lib/NumberUtils";

interface IMutationTypeFormat {
    label?: string;
    longName?: string;
    className: string;
    mainType: string;
    priority?: number;
}

/**
 * @author Avery Wang
 */
export default class ClonalColumnFormatter {
    
    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}"Clonal" text value
     */
    public static getDisplayValue(data:Mutation[], sampleIds:string[]) {
        let values = [];
        const sampleToValue:{[key: string]: string} = {};
        const sampleToCCFMCopiesUpper:{[key: string]: number} = {};
        
        for (const mutation of data) {
            sampleToValue[mutation.sampleId] = ClonalColumnFormatter.getClonalValue([mutation]);
        }
        for (const mutation of data) {
            sampleToCCFMCopiesUpper[mutation.sampleId] = mutation.ccfMCopiesUpper;
        }
        // exclude samples with invalid count value (undefined || emtpy || lte 0)
        const samplesWithValue = sampleIds.filter(sampleId =>
            sampleToValue[sampleId] && sampleToValue[sampleId].toString().length > 0);

        // single value: just add the actual value only
        let tdValue = null;
        if (!samplesWithValue) {
            return (<span></span>);
        } else if (samplesWithValue.length === 1) {
             tdValue = <li><DefaultTooltip overlay={ClonalColumnFormatter.getTooltip(`${samplesWithValue[0]}`, `${sampleToValue[samplesWithValue[0]]}`, `${sampleToCCFMCopiesUpper[samplesWithValue[0]]}`)} placement="left" arrowContent={<div className="rc-tooltip-arrow-inner"/>}>{ClonalColumnFormatter.getClonalCircle(sampleToValue[samplesWithValue[0]])}</DefaultTooltip></li>;
        }
        // multiple value: add sample id and value pairs
        else {
             tdValue = samplesWithValue.map((sampleId:string) => {
                return (
                    <li><DefaultTooltip overlay={ClonalColumnFormatter.getTooltip(`${sampleId}`, `${sampleToValue[sampleId]}`, `${sampleToCCFMCopiesUpper[sampleId]}`)} placement="left" arrowContent={<div className="rc-tooltip-arrow-inner"/>}>{ClonalColumnFormatter.getClonalCircle(`${sampleToValue[sampleId]}`)}</DefaultTooltip></li>
                );
            });
        }
        return (
                <span style={{display:'inline-block', minWidth:100}}>
                    <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ tdValue }</ul>
                </span> 
               );
    }
    
    public static getTooltip(sampleId:string, clonalValue:string, ccfMCopiesUpperValue:string) {
        let clonalColor = "";
        if (clonalValue === "yes") {
            clonalColor = "limegreen";
        } else if  (clonalValue === "no") {
            clonalColor = "dimgrey";
        } else {
            clonalColor = "lightgrey";
        }
        return (
                <div> 
                        <table>
                                <tr><td>Sample</td><td><strong>{sampleId}</strong></td></tr>
                                <tr><td>Clonal</td><td><span style={{color: `${clonalColor}`, fontWeight: "bold"}}>{clonalValue}</span></td></tr>
                                <tr><td style={{paddingRight:5}}>CCF Upper</td><td><strong>{ccfMCopiesUpperValue}</strong></td></tr>
                        </table>
                </div>
        );  
    }

    public static getClonalCircle(clonalValue:string) {
        let color:string = "";
        if (clonalValue === "yes") {
            color = "limegreen";
        } else if (clonalValue === "no") {
            color = "dimgrey";
        } else {
            color = "lightgrey";
        }
        return (
                <svg height="10" width="10">
                    <circle cx={5} cy={5} r={5} fill={`${color}`}/>
                </svg>
        );
    }
 
    public static getCcfMCopiesUpperValue(data:Mutation[]):number {
        const ccfMCopiesUpperValue = data[0].ccfMCopiesUpper;
        return ccfMCopiesUpperValue;
    }

    public static getCcfMCopiesValue(data:Mutation[]):number {
        const ccfMCopiesValue = data[0].ccfMCopies;
        return ccfMCopiesValue;
    }

    public static getClonalValue(data:Mutation[]):string {
        let textValue:string = "";
        const ccfMCopiesUpperValue = ClonalColumnFormatter.getCcfMCopiesUpperValue(data);
        if (floatValueIsNA(ccfMCopiesUpperValue)) {
            textValue = "";
        } else if (ccfMCopiesUpperValue === 1) {
            textValue = "yes";
        } else {
            textValue = "no";
        }
        return textValue;
    }

    public static renderFunction(data:Mutation[], sampleIds:string[]) {
        // use text for all purposes (display, sort, filter)
        return ClonalColumnFormatter.getDisplayValue(data,sampleIds);
        /*
        const text:string = ClonalColumnFormatter.getDisplayValue(data, sampleIds);
        if (text === "yes") {
            return (<svg>
                        <circle cx={10} cy={10} r={5} fill="green" />
                    </svg>
            );
        } else {
            let content = <span>{text}</span>;
            return content;
        }
        */
    }
    
    public static getClonalDownload(mutations:Mutation[]): string|string[]
    {
        let result = [];
        if (mutations) {
            for (let mutation of mutations) {
                result.push(ClonalColumnFormatter.getClonalValue([mutation]));
            }
        }
        if (result.length == 1) {
            return result[0];
        }
        return result;
    }
}

