<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
    import {Xterm} from './Xterm'
    import 'xterm/css/xterm.css'
    let termdiv:HTMLElement;
    let xterm:any;
    export let ID=null;
    const dispatch = createEventDispatcher()
    export  function SetId(id:string){
        ID=id;
        xterm = new Xterm(id,termdiv,(cmd:string,obj:Object)=>{
            dispatch('invoke',{cmd:cmd,data:obj}); 
        });
    }
    export  function setMessage(msg:string){
        xterm.setMessage(msg);
    }
    onMount(()=>{
        
    })   
    function resize(){
        xterm.fitAddon.fit();
       // invoke('resize_pty',{id,size:{rows:120,cols:100,pixel_width:1024,pixel_height:1024}})
    }
    window.onresize=resize
</script>
<div class="term" bind:this={termdiv} on:resize={resize} />
<style>
    
    .term {
      overflow: auto;
      background: #000;
      height: -webkit-calc(100% - (132px));
      height: -moz-calc(100% - (132px));
      height: calc(100vh - (132px));
      font-size: 10px;
      line-height: 17px; /* <- initial line-height */
    }
</style>