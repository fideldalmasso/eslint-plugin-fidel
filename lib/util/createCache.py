import re
import os
import pathlib
import json
from pathlib import Path


def get_component_name(file_name):
    return file_name[file_name.rfind('/')+1:-4]     # text from last / to .jsx -> component name

def remove_comments(string):
    pattern = r"(\".*?\"|\'.*?\')|(/\*.*?\*/|//[^\r\n]*$)"
    # first group captures quoted strings (double or single)
    # second group captures comments (//single-line or /* multi-line */)
    regex = re.compile(pattern, re.MULTILINE|re.DOTALL)
    def _replacer(match):
        # if the 2nd group (capturing comments) is not None,
        # it means we have captured a non-quoted (real) comment string.
        if match.group(2) is not None:
            return "" # so we will return empty to remove the comment
        else: # otherwise, we will return the 1st group
            return match.group(1) # captured quoted-string
    return regex.sub(_replacer, string)

def get_component_props(file_name):
    with open(file_name) as file:
        data = file.read()
        data = remove_comments(data)
        # print(data)
        result = re.search(r"{([,./\w\s]*)} = props", data)
        if(result):
            result = result.group(1)
            result = re.sub(r"[\n\s\t]",'',result)
            result = result.split(",")
        return result

def get_container_name(component_name):
    return re.sub(rf"View|Dialog", "Container", component_name)


# def analyzeOccurence(file_name,component_name, container_name):
#     with open(file_name) as file:
#         data = file.read()
#         # print(file_name)

#         result = re.search(rf"import (.*) from .*({component_name}|{container_name}|{component_name+'Container'})';",data)


#         if(result):
#             used_name = result.group(1)
#             print("Find occurence in:",used_name, '->', file_name)
#             result2 = re.search("[\t\s]<"+used_name+"([ .\n\t\sa-zA-Z=\{\}\(\)<>\d]*)(/>|></)", data)
#             if(result2):
#                 print(result2.group(1))
#                 result3 = re.search("[a-zA-Z]",result2)
#             else:
#                 print("no encontrado xd")
#         return result

def analize_container(file_name):
    with open(file_name) as file:
        data = file.read()
        data = remove_comments(data)
        result = re.search(r"connect\(.+\)\((.+)\)", data)
        if(result):
            result = result.group(1)
            variableName = re.search(result+" from '(.+)'",data)
            if(variableName):
                fileNavigation = variableName.group(1)
                xd = os.path.dirname(file_name)+'/'+fileNavigation+'.jsx'
                p  = Path(xd)
                componentFile = ""
                try:
                    componentFile = p.resolve(strict=True)
                except:
                    # if .jsx not found, must be .js then
                    xd2 = xd.replace('.jsx','.js')
                    p2 = Path(xd2)
                    componentFile = p2.resolve(strict=True)
                    pass
                relative_path = os.path.relpath(componentFile, pathlib.Path('./'))
                result = str(relative_path)
                
        return result


cache = {}
archivo = "src/components/Modal/GetHelpModal/getHelpModalView.jsx"
valid_props = get_component_props(archivo)
component_name = get_component_name(archivo)
container_name = get_container_name(component_name)
# print(lista)

for file_name in pathlib.Path('./src/').rglob("*"):
    file_name = str(file_name)
    if(file_name.endswith(".jsx")):
        if not file_name in cache:
            cache[file_name] = {}
        cache[file_name]["validProps"]=get_component_props(file_name)
    elif(file_name.endswith("Container.js")):
        componentFile = analize_container(file_name)
        if(componentFile):
            if not componentFile in cache:
                cache[componentFile] = {}
            cache[componentFile]["container"] = file_name
    # analyzeOccurence(file_name,component_name,container_name)
    



    # pattern = r"(\".*?\"|\'.*?\')|(/\*.*?\*/|//[^\r\n]*$)"
    # {([,./\w\s]*)} = props;
# print(json.dumps(cache),)

with open('fidel.json', 'w', encoding='utf-8') as f:
    json.dump(cache, f, ensure_ascii=False, indent=4)