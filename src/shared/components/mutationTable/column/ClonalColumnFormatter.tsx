import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "public-lib/lib/getCanonicalMutationType";
import {floatValueIsNA} from "shared/lib/NumberUtils";
import {hasASCNProperty} from "shared/lib/MutationUtils";

/**
 * @author Avery Wang
 */

export function getClonalValue(mutations:Mutation[]):string {
    let textValue:string = "NA";
    if (hasASCNProperty(mutations[0], "clonal")) {
        textValue = mutations[0].alleleSpecificCopyNumber.clonal ? "yes" : "no";
    }
    return textValue;
}

export function getClonalColor(clonalValue:string):string {
    let clonalColor:string = "";
    if (clonalValue === "yes") {
        clonalColor = "limegreen";
    } else if (clonalValue === "no") {
        clonalColor = "dimgrey";
    } else {
        clonalColor = "lightgrey";
    }
    return clonalColor;
}

export function getClonalCircle(clonalValue:string) {
    let clonalColor = getClonalColor(clonalValue);
    return (
            <svg height="10" width="10">
                <circle cx={5} cy={5} r={5} fill={`${clonalColor}`}/>
            </svg>
    );
}

export default class ClonalColumnFormatter {

    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}"Clonal" text value
     */
    public static getDisplayValue(data:Mutation[], sampleIds:string[]) {
        let values:string[] = [];
        const sampleToValue:{[key: string]: any} = {};
        const sampleToCCF:{[key: string]: any} = {};
        for (const mutation of data) {
            sampleToValue[mutation.sampleId] = getClonalValue([mutation]);
        }
        
        for (const mutation of data) {
            // check must be done because members without values will not be returned in the backend response
            sampleToCCF[mutation.sampleId] = hasASCNProperty(mutation, "ccfMCopies") ? mutation.alleleSpecificCopyNumber.ccfMCopies : "NA";
        }
        // exclude samples with invalid count value (undefined || emtpy || lte 0)
        const samplesWithValue = sampleIds.filter(sampleId =>
            sampleToValue[sampleId] && sampleToValue[sampleId].toString().length > 0);

        // single value: just add the actual value only
        let tdValue = null;
        if (!samplesWithValue) {
            return <span />;
        } else if (samplesWithValue.length === 1) {
            tdValue = ClonalColumnFormatter.getClonalListElement(samplesWithValue[0], sampleToValue[samplesWithValue[0]], sampleToCCF[samplesWithValue[0]]);
        }
        // multiple value: add sample id and value pairs
        else {
             tdValue = samplesWithValue.map((sampleId:string) => {
                return (
                    <li><DefaultTooltip overlay={ClonalColumnFormatter.getTooltip(`${sampleId}`, `${sampleToValue[sampleId]}`, `${sampleToCCF[sampleId]}`)} placement="left" arrowContent={<div className="rc-tooltip-arrow-inner"/>}>{getClonalCircle(`${sampleToValue[sampleId]}`)}</DefaultTooltip></li>
                );
            });
        }
        return (
                <span style={{display:'inline-block', minWidth:100}}>
                    <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ tdValue }</ul>
                </span>
               );
    }


    public static getTooltip(sampleId:string, clonalValue:string, ccfMCopies:string) {
        let clonalColor = getClonalColor(clonalValue);
        return (
                <div>
                    <table>
                        <tr><td style={{paddingRight:5}}>Clonal</td><td><span style={{color: `${clonalColor}`, fontWeight: "bold"}}>{clonalValue}</span></td></tr>
                        <tr><td style={{paddingRight:5}}>CCF</td><td><strong>{ccfMCopies}</strong></td></tr>
                    </table>
                </div>
        );
    }

    public static getClonalListElement(sampleId:string, clonalValue:string, ccfMCopies:string) {
        return (
            <li><DefaultTooltip overlay={ClonalColumnFormatter.getTooltip(`${sampleId}`, `${clonalValue}`, `${ccfMCopies}`)} placement="left" arrowContent={<div className="rc-tooltip-arrow-inner"/>}>{getClonalCircle(clonalValue)}</DefaultTooltip></li>
        );
    }

    public static renderFunction(data:Mutation[], sampleIds:string[]) {
        return ClonalColumnFormatter.getDisplayValue(data,sampleIds);
    }

    public static getClonalDownload(mutations:Mutation[]): string|string[]
    {
        let result = [];
        if (mutations) {
            for (let mutation of mutations) {
                result.push(getClonalValue([mutation]));
            }
        }
        if (result.length == 1) {
            return result[0];
        }
        return result;
    }
}
