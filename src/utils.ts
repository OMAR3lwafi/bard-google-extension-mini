import Browser from 'webextension-polyfill'
import { Theme, BASE_URL } from './config'

export function detectSystemColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return Theme.Dark
  }
  return Theme.Light
}

export function getExtensionVersion() {
  return Browser.runtime.getManifest().version
}

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const isFirefox = navigator.userAgent.indexOf('Firefox') != -1

export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export const AppName = 'GoogleBard - Bard chat from search page'


export function extract_followups_section(answer_text:string) {
  const splits = answer_text.split(/\**#{3}|#{2}|#{1}|#{0}\**\ *\**[fF]ollow-up [qQ]uestions:*\**/);
  let followup_section = "";
  if (splits.length >= 2) {
    followup_section = splits[splits.length - 1]
  }
  if (!followup_section.includes("?")) {
    answer_text = answer_text.replace(followup_section,'')
    let lastIndex = answer_text.lastIndexOf("?");
    answer_text = answer_text.substring(0, lastIndex + 1);
    const splits2 = answer_text.split(/\**#{3}|#{2}|#{1}|#{0}\**\ *\**[fF]ollow-up [qQ]uestions:*\**/);
    followup_section = "";
    if (splits2.length >= 2) {
      followup_section = splits2[splits2.length - 1]
    }
  }
  return followup_section;
}

export function extract_followups(followup_section:string) {
  console.log("Will extract_followups from followup_section:", followup_section)
  let final_followups = [];
  if (followup_section.length > 0) {
    let rawsplits = followup_section.split("\n");
    for(var i = 0; i < rawsplits.length; i++) {
      let regnumexp = /[0-9]..*/gi;
      let regbulletexp = /[*+-] .*/gi;
      if (rawsplits[i].match(regnumexp)) {
        final_followups.push(rawsplits[i].slice(2).trim());
      } else if (rawsplits[i].match(regbulletexp)) {
        let x = rawsplits[i].replace(/[^a-zA-Z ,?]/g, "").trim();
        if (x) {
          final_followups.push(x);
        } else {
          let finesplits = rawsplits[i].split("* ");
          if (finesplits[finesplits.length-1].length > 4 && finesplits[finesplits.length-1].trim()[finesplits[finesplits.length-1].trim().length-1]=="?")
            final_followups.push(finesplits[finesplits.length-1].trim());
        }
      }
    }
  }
  let final_followups_deduped = [...new Set(final_followups)];
  console.log("final_followups_deduped:", final_followups_deduped)
  return final_followups_deduped;
}
