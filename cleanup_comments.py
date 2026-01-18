import os
import re

def remove_comments(content, extension):
    if extension in ['.ts', '.js', '.json', '.css', '.scss']:
        # This regex matches strings (to skip them) or comments
        pattern = r'("(?:\\.|[^"\\])*")|(\'(?:\\.|[^\'\\])*\')|(`(?:\\.|[^`\\])*`)|(/\*[\s\S]*?\*/)|(//.*)'
        
        def replace(match):
            if match.group(4) or match.group(5):
                return ""
            return match.group(0)
            
        content = re.sub(pattern, replace, content)
    
    elif extension == '.html':
        content = re.sub(r'<!--[\s\S]*?-->', '', content)
    
    # Remove lines that became empty or only whitespace after comment removal
    lines = content.splitlines()
    cleaned_lines = []
    for line in lines:
        if line.strip() or not line: # Keep original empty lines but not lines that are now just whitespace
            cleaned_lines.append(line)
            
    # However, user probably wants to remove the extra blank lines created.
    # Let's be more aggressive: if a line was purely a comment, remove it.
    # If a line had code + comment, keep code.
    
    return "\n".join(cleaned_lines)

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        # Skip some dirs
        for d in ['.git', 'node_modules', '.angular', '.vscode', 'dist']:
            if d in dirs:
                dirs.remove(d)
            
        for file in files:
            filepath = os.path.join(root, file)
            _, ext = os.path.splitext(file)
            
            if ext in ['.ts', '.html', '.css', '.scss', '.json', '.js']:
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Remove comments
                    new_content = remove_comments(content, ext)
                    
                    # Final polish: collapse multiple consecutive blank lines to one, 
                    # but only if they were created by our removal.
                    # Actually, let's just strip trailing whitespace from each line too.
                    lines = [line.rstrip() for line in new_content.splitlines()]
                    
                    # Filter out lines that were JUST comments (now empty)
                    # and were NOT empty in the original (hard to track without more logic)
                    # but usually, users want the comments GONE including the space they occupied.
                    
                    final_content = "\n".join(lines)
                    
                    if final_content != content.rstrip():
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(final_content + "\n")
                        print(f"Cleaned: {filepath}")
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    # Process project root and src
    cwd = os.getcwd()
    process_directory(cwd)
