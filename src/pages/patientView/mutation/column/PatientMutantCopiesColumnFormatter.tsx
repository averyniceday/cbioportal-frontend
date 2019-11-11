import * as React from 'react';
import DefaultTooltip from "public-lib/components/defaultTooltip/DefaultTooltip";
import {Mutation, ClinicalData} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "public-lib/lib/getCanonicalMutationType";
import SampleManager from "../../SampleManager";
import {getMutantCopiesToolTipBySample,
    getSampleIdToMutantCopiesMap,
    getMutantCopiesOverTotalCopies,
    constructToolTipString} from "shared/components/mutationTable/column/MutantCopiesColumnFormatter";

/**
 * @author Avery Wang
 */
export default class PatientMutantCopiesColumnFormatter {

    public static renderFunction(data:Mutation[], sampleIds:string[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return <span />;
        }
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
                let componentBySample = sampleManager.getComponentForSample(sampleId, 1, "");
                return (
                    <li>
                        <DefaultTooltip 
                            overlay={
                                <span key={sampleId}>
                                    {componentBySample} {toolTipBySample[sampleId]}
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
}
