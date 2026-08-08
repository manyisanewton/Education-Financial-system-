import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { englishFromSwahili, swahiliPhrases } from '../../i18n/phraseTranslations'

const originalText=new WeakMap<Text,string>();const originalAttributes=new WeakMap<Element,Record<string,string>>();const attributes=['placeholder','title','aria-label']
const translatePhrase=(english:string,language:'en'|'sw')=>language==='sw'?(swahiliPhrases[english]||english):english
const normalizeEnglish=(value:string,language:'en'|'sw')=>language==='sw'?(englishFromSwahili[value]||value):value

export default function LanguageBridge(){const {language}=useApp();const {pathname}=useLocation();useEffect(()=>{document.documentElement.lang=language;localStorage.setItem('shulefinance_language',language)
 const processText=(node:Text)=>{const current=node.nodeValue||'';if(!current.trim())return;if(!originalText.has(node))originalText.set(node,normalizeEnglish(current.trim(),language));const english=originalText.get(node)!;const translated=translatePhrase(english,language);const next=current.replace(current.trim(),translated);if(next!==current)node.nodeValue=next}
 const processElement=(element:Element)=>{if(element.classList.contains('material-symbols-rounded'))return;const stored=originalAttributes.get(element)||{};for(const attribute of attributes){const value=element.getAttribute(attribute);if(value&&!stored[attribute])stored[attribute]=normalizeEnglish(value,language);if(stored[attribute]){const next=translatePhrase(stored[attribute],language);if(value!==next)element.setAttribute(attribute,next)}}originalAttributes.set(element,stored);for(const child of Array.from(element.childNodes)){if(child.nodeType===Node.TEXT_NODE)processText(child as Text);else if(child.nodeType===Node.ELEMENT_NODE)processElement(child as Element)}}
 const frame=requestAnimationFrame(()=>processElement(document.body));return()=>cancelAnimationFrame(frame)},[language,pathname]);return null}
