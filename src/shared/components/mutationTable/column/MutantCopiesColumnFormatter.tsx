import * as React from 'react';
import DefaultTooltip from 'shared/components/defaultTooltip/DefaultTooltip';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationType.module.scss";
import getCanonicalMutationType from "shared/lib/getCanonicalMutationType";

interface IMutationTypeFormat {
    label?: string;
    longName?: string;
    className: string;
    mainType: string;
    priority?: number;
}

/**
 * @author Selcuk Onur Sumer
 */
export default class MutantCopiesColumnFormatter
{
    /* Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}    mutation assessor text value
     */
    public static getDisplayValue(data:Mutation[]):string
    {
        return MutantCopiesColumnFormatter.getMutantCopiesOverTotalCopies(data);
    }

    public static getVariantAlleleFraction(data:Mutation[]):number
    {
        let variantAlleleFraction = 0;
        if (data.length > 0) {
            let refreads:number = data[0].tumorRefCount;
            let altreads:number = data[0].tumorAltCount;
            variantAlleleFraction = altreads/(refreads + altreads);
        }
        return variantAlleleFraction;
    }

    public static getMutantCopies(data:Mutation[]):number
    {
        let purity:number = data[0].purity;
        let totalCopyNumber:number = data[0].totalCopyNumber;
        let variantAlleleFraction:number = MutantCopiesColumnFormatter.getVariantAlleleFraction(data);
        let mutantCopies:number = Math.max(1, Math.min(totalCopyNumber, Math.round((variantAlleleFraction/purity)*totalCopyNumber)))
        return mutantCopies;
    }
 
    public static getMutantCopiesOverTotalCopies(data:Mutation[]):string
    {
        let textValue:string = "";
        let totalCopyNumber:number = data[0].totalCopyNumber;
        let mutantCopies:number = MutantCopiesColumnFormatter.getMutantCopies(data)
        if (mutantCopies != null && totalCopyNumber != null && totalCopyNumber != 0) {
            textValue = mutantCopies.toString(10) + "/" + totalCopyNumber.toString(10);
        } else {
            textValue = "NA";
        }
        return textValue;
    }
        
    public static getMutantCopiesToolTip(data:Mutation[]):string
    {
        let textValue:string = "";
        let totalCopyNumber:number = data[0].totalCopyNumber;
        let mutantCopies:number = MutantCopiesColumnFormatter.getMutantCopies(data);
        if (mutantCopies != null && totalCopyNumber != null && totalCopyNumber != 0) {
            textValue = mutantCopies.toString(10) + " out of " + totalCopyNumber.toString(10) + " copies of this gene are mutated";
        } else {
            textValue = "Missing data values, mutant copies can not be computed";
        }
        return textValue;
    }
    
    public static renderFunction(data:Mutation[])
    {
        // use text for all purposes (display, sort, filter)
        const text:string = MutantCopiesColumnFormatter.getDisplayValue(data);

        // use actual value for tooltip
        const toolTip:string = MutantCopiesColumnFormatter.getMutantCopiesToolTip(data);

        let content = <span>{text}</span>;

        // add tooltip only if the display value differs from the actual text value!
        const arrowContent = <div className="rc-tooltip-arrow-inner"/>;

        content = (
            <DefaultTooltip overlay={<span>{toolTip}</span>} placement="left" arrowContent={arrowContent}>
                {content}
            </DefaultTooltip>
        );

        return content;
    }
}

