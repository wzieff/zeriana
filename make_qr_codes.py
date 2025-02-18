
import shutil
import os
import qrcode

qr_folder = 'qr_codes'

text_list = [
     'QR_CODE_REMOVE_IMAGE'
    ,'QR_CODE_IMAGE_01'
    ,'QR_CODE_IMAGE_02'
    ,'QR_CODE_IMAGE_03'
]

qr_folder_path = os.path.join(os.getcwd(),qr_folder)
print(qr_folder_path)


# Delete everything inside the folder, including subfolders
shutil.rmtree(qr_folder_path)

# Recreate the empty folder
os.makedirs(qr_folder_path)

# create a text-based qr code
# qr = qrcode.QRCode()
# qr.add_data("QR_TEST")
# qr.make()
# print(qr.modules)  # Displays a text-based QR code

for t in text_list:
    # create a png
    qr = qrcode.make(t)
    pngfile = os.path.join(qr_folder_path, t + '.png')
    qr.save(pngfile)  # Saves as an image
    print(f'Generated: {pngfile}')
