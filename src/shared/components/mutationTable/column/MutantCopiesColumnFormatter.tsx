import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import {Mutation, ClinicalData} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "public-lib/lib/getCanonicalMutationType";
import {hasASCNProperty} from "shared/lib/MutationUtils";

/**
 * Returns map of sample id to tooltip text value.
 * @param data
 */
export function getMutantCopiesToolTipBySample(data:Mutation[]):{[key: string]: string} {
    const sampleToToolTip:{[key: string]: string} = {};
    for (const mutation of data) {
        sampleToToolTip[mutation.sampleId] = constructToolTipString(mutation);
    }
    return sampleToToolTip;
}

/**
 * Constructs tooltip string value.
 * @param mutation
 */
export function constructToolTipString(mutation:Mutation):string {
    return (hasASCNProperty(mutation, "mutantCopies") &&
        hasASCNProperty(mutation, "totalCopyNumber")) ? mutation.alleleSpecificCopyNumber.mutantCopies.toString(10) + 
        " out of " + mutation.alleleSpecificCopyNumber.totalCopyNumber.toString(10) +
        " copies of this gene are mutated." : "Missing data values, mutant copies can not be computed.";
}

export function getSampleIdToMutantCopiesMap(data:Mutation[]):{[key: string]: string} {
    const sampleToValue:{[key: string]: string} = {};
    for (const mutation of data) {
        const value:string = getMutantCopiesOverTotalCopies(mutation);
        if (value.toString().length > 0) {
            sampleToValue[mutation.sampleId] = value;
        }
    }
    return sampleToValue;
}

export function getMutantCopiesOverTotalCopies(mutation:Mutation):string {
    return (hasASCNProperty(mutation, "totalCopyNumber") &&
        hasASCNProperty(mutation, "mutantCopies")) ? mutation.alleleSpecificCopyNumber.totalCopyNumber.toString() + 
        "/" + mutation.alleleSpecificCopyNumber.mutantCopies.toString() : "";
}

/**
 * @author Avery Wang
 */
export default class MutantCopiesColumnFormatter {

    public static getDisplayValueAsString(data:Mutation[], sampleIds:string[]):string {
        const displayValuesBySample:{[key: string]: string} = getSampleIdToMutantCopiesMap(data);
        const sampleIdsWithValues = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
        const displayValuesAsString = sampleIdsWithValues.map((sampleId:string) => {
            return displayValuesBySample[sampleId];
        })
        return displayValuesAsString.join("; ");
    }

    public static renderFunction(data:Mutation[], sampleIds:string[]) {
        // get display text values map (sampleid -> value), list of sample ids with values in 'displayValuesBySample', and calculate tooltip by sample
        const displayValuesBySample:{[key: string]: string} = getSampleIdToMutantCopiesMap(data);
        const toolTipBySample:{[key: string]: string} = getMutantCopiesToolTipBySample(data);
        const sampleIdsWithValues = sampleIds.filter(sampleId => displayValuesBySample[sampleId]);
        if (!sampleIdsWithValues) {
            return <span />;
        } else {
            let content = sampleIdsWithValues.map((sampleId:string) => {
                let textValue = displayValuesBySample[sampleId];
                // if current item is not last sample in list then append '; ' to end of text value
                if (sampleIdsWithValues.indexOf(sampleId) !== (sampleIdsWithValues.length - 1)) {
                    textValue = textValue + "; ";
                }
                return (
                    <li>
                        <DefaultTooltip 
                            overlay={
                                <span>
                                    {toolTipBySample[sampleId]}
                                </span>
                            }
                            placement='left'
                            arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                        >
                            <span>{textValue}</span>
                        </DefaultTooltip>
                    </li>
                );
            })
            return (
             <span style={{display:'inline-block', minWidth:100}}>
                 <ul style={{marginBottom:0}} className="list-inline list-unstyled">{ content }</ul>
             </span>
            );
       }
    }

    public static getMutantCopiesDownload(mutations:Mutation[]) {
        let result = [];
        if (mutations) {
            for (let mutation of mutations) {
                result.push(getMutantCopiesOverTotalCopies(mutation));
            }
        }
        if (result.length == 1) {
            return result[0];
        }
        return result;
    }

}
