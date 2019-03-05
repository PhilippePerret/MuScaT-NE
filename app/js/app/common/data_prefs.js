'use strict'
/**
 * Données des préférences
 * =======================
 *
 *  Property `monit`    Every change should be made instantly in the
 *                      analysis table. And when an analysis is opened.
 *  Property `apref`    If `apref` property is not false, the property is saved in
 *                      the own analysis preferences file. Default: indefined
 *  Property `dom`      If defined, all DOMElement of this class is affected
 *                      by the change.
 *  Property `prop`     The property affected by the change. F.i. "font-size"
 *  Property `u`        Unit to add to value
 *  Property 'fct'      Function to call to apply the preference. The value of the
 *                      pref is send as first argument of the function.
 */
const DATA_PREFS = {
    preference_id: {is: 'data preference_id', apref: false}

    // Dernière analyse
  , last_analyse_path: {defValue: null, apref: false}
  , open_last_at_launch: {defValue: false, apref: false}

    // --- Fenêtre des préférences ---
  , prefs_window_height:  {defValue: 460, apref: false}
  , prefs_window_width:   {defValue: 800, apref: false}
  , prefs_onglets_width:  {defValue: 150, apref: false}

    //  --- Langue et thème ---
  , lang:             {defValue: (process.env.LANG?process.env.LANG.substring(0,2):'en'), monit: true, fct: (v)=>{UI.setLang(v)}}
  , theme:            {defValue: 'muscat',  monit: true, fct: (v) => {UI.setTheme(v)}}
  , default_analysis_folder: {defValue: null, apref: false}
  , chord_fsize:      {defValue: 17, monit: true, tag: true, dom: '.chord', prop: 'font-size', u: 'px'}
  , harmony_fsize:    {defValue: 18, monit: true, tag: true, dom: '.harmony', prop: 'font-size', u: 'px'}
  , cadence_fsize:    {defValue: 19, monit: true, tag: true, dom: '.cadence', prop: 'font-size', u: 'px'}
  , modulation_fsize: {defValue: 20, monit: true, tag: true, dom: '.modulation', prop: 'font-size', u: 'px'}
  , part_fsize:       {defValue: 17, monit: true, tag: true, dom: '.part', prop: 'font-size', u: 'px'}
  , measure_fsize:    {defValue: 17, monit: true, tag: true, dom: '.measure', prop: 'font-size', u: 'px'}
  , degree_fsize:     {defValue: 17, monit: true, tag: true, dom: '.degree', prop: 'font-size', u: 'px'}
  , text_fsize:       {defValue: 17, monit: true, tag: true, dom: '.text.real', prop: 'font-size', u: 'px'}

  , references_lines: {defValue: false, monit: true, fct: (v) => {UI.toggleReferenceLines(v)}}
  , visor:            {defValue: false, monit: true, fct: (v) => {UI.toggleVisor(v)}}

  // --- INTERFACE ---
  , ui_code_fsize:    {defValue: 15, monit: true, dom: 'litag', prop: 'font-size', u: 'px', apref: false}

  // --- ANIMATION ---
  , animation_speed:  {defValue: 50}
}

module.exports = DATA_PREFS
